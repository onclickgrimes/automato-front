import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/route-handler';
import {
  InstagramPostsPayload,
  InstagramPost,
  CreateInstagramPostData,
  InstagramPostResponse,
  ValidationResult,
  ValidationError
} from '@/lib/types/instagram-posts';

// Função para validar o payload
function validatePostsPayload(payload: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!payload.username || typeof payload.username !== 'string') {
    errors.push({ field: 'username', message: 'Username é obrigatório e deve ser uma string' });
  }

  if (!Array.isArray(payload.posts)) {
    errors.push({ field: 'posts', message: 'Posts deve ser um array' });
  } else {
    payload.posts.forEach((post: any, index: number) => {
      if (!post.url || typeof post.url !== 'string') {
        errors.push({ field: `posts[${index}].url`, message: 'URL é obrigatória' });
      }

      if (!post.username || typeof post.username !== 'string') {
        errors.push({ field: `posts[${index}].username`, message: 'Username é obrigatório' });
      }

      if (post.likes !== undefined && (typeof post.likes !== 'number' || post.likes < 0)) {
        errors.push({ field: `posts[${index}].likes`, message: 'Likes deve ser um número não negativo' });
      }

      if (post.comments !== undefined && (typeof post.comments !== 'number' || post.comments < 0)) {
        errors.push({ field: `posts[${index}].comments`, message: 'Comments deve ser um número não negativo' });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Função para extrair post_id da URL
function extractPostId(url: string, providedPostId?: string): string {
  if (providedPostId) {
    return providedPostId;
  }

  const match = url.match(/\/(p|reel)\/([^/]+)\//)?.[2];
  return match || url;
}

// Função para transformar post do backend para formato do banco
function transformPostForDatabase(post: any, userId: string): CreateInstagramPostData {
  return {
    user_id: userId,
    url: post.url,
    post_id: extractPostId(post.url, post.post_id),
    username: post.username,
    caption: post.caption || null,
    likes: post.likes || 0,
    comments: post.comments || 0,
    post_date: post.post_date || post.date || null,
    liked_by_users: post.liked_by_users || post.likedByUsers || [],
    followed_likers: post.followed_likers || post.followedLikers || false
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerSupabaseClient();

    // Verificar autenticação (usuário logado OU API key válida)
    const apiKey = request.headers.get('x-api-key');
    const isValidApiKey = apiKey === process.env.INTERNAL_API_KEY;
    
    let userId: string;
    
    if (isValidApiKey) {
      // Se tem API key válida, usar user_id do payload
      const tempPayload = await request.json();
      userId = tempPayload.user_id;
      
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'user_id é obrigatório quando usando API key' },
          { status: 400 }
        );
      }
      
      // Recriar o request com o payload para uso posterior
      request = new NextRequest(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(tempPayload)
      });
    } else {
      // Verificação de autenticação normal para usuários
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: 'Não autorizado' },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    // Obter e validar payload
    const payload: InstagramPostsPayload = await request.json();
    console.log(`📝 Payload para sincronização (completo):`, JSON.stringify(payload, null, 2));
    const validation = validatePostsPayload(payload);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    const createdPosts: InstagramPost[] = [];
    const errors: string[] = [];

    // Processar cada post
    for (const post of payload.posts) {
      try {
        const postData = transformPostForDatabase(post, userId);

        // Tentar inserir ou atualizar o post (upsert)
        const { data, error } = await supabase
          .from('instagram_posts')
          .upsert(
            postData,
            {
              onConflict: 'post_id,user_id',
              ignoreDuplicates: false
            }
          )
          .select()
          .single();

        if (error) {
          console.error('Erro ao salvar post:', error);
          errors.push(`Erro ao salvar post ${post.url}: ${error.message}`);
        } else {
          createdPosts.push(data);
        }
      } catch (postError) {
        console.error('Erro ao processar post:', postError);
        errors.push(`Erro ao processar post ${post.url}: ${postError}`);
      }
    }

    // Preparar resposta
    const response: InstagramPostResponse = {
      success: createdPosts.length > 0,
      data: createdPosts,
      count: createdPosts.length,
      message: `${createdPosts.length} posts processados com sucesso`
    };

    if (errors.length > 0) {
      response.error = `${errors.length} erros encontrados: ${errors.join('; ')}`;
    }

    const statusCode = createdPosts.length > 0 ? 201 : 400;
    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('Erro na rota de posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// GET - Buscar posts do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerSupabaseClient();

    // Verificar autenticação (usuário logado OU API key válida)
    const apiKey = request.headers.get('x-api-key');
    const isValidApiKey = apiKey === process.env.INTERNAL_API_KEY;
    
    let userId: string;
    
    if (isValidApiKey) {
      // Se tem API key válida, usar user_id do query parameter
      const { searchParams } = new URL(request.url);
      const userIdParam = searchParams.get('user_id');
      
      if (!userIdParam) {
        return NextResponse.json(
          { success: false, error: 'user_id é obrigatório quando usando API key' },
          { status: 400 }
        );
      }
      userId = userIdParam;
    } else {
      // Verificação de autenticação normal para usuários
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: 'Não autorizado' },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    // Obter parâmetros de query
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const followedLikers = searchParams.get('followed_likers');
    const maxAge = parseInt(searchParams.get('max_age') || '0');
    const maxAgeUnit = searchParams.get('max_age_unit') || 'hours';
    const maxAgeHours = parseInt(searchParams.get('max_age_hours') || '0'); // Compatibilidade
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir query
    let query = supabase
      .from('instagram_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Aplicar filtros
    if (username) {
      query = query.eq('username', username);
    }

    if (followedLikers !== null) {
      query = query.eq('followed_likers', followedLikers === 'true');
    }

    // Filtrar por idade do post (se especificado)
    let finalMaxAgeHours = maxAgeHours; // Para compatibilidade com parâmetro antigo
    
    if (maxAge > 0) {
      // Converter para horas baseado na unidade
      if (maxAgeUnit === 'minutes') {
        finalMaxAgeHours = maxAge / 60;
      } else {
        finalMaxAgeHours = maxAge;
      }
    }
    
    if (finalMaxAgeHours > 0) {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - finalMaxAgeHours);
      query = query.gte('post_date', cutoffDate.toISOString());
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar posts:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar posts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0,
      message: `${data?.length || 0} posts encontrados`
    });

  } catch (error) {
    console.error('Erro na rota de posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}