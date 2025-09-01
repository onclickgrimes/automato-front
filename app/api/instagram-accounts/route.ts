import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/route-handler';
import { CreateInstagramAccountData, InstagramAccountFilters } from '@/lib/types/instagram-accounts';

// GET /api/instagram-accounts - Buscar contas com filtros
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerSupabaseClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Extrair parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const filters: InstagramAccountFilters = {
      user_id: user.id // Sempre filtrar pelo usuário atual
    };

    // Adicionar filtros opcionais
    const username = searchParams.get('username');
    if (username) filters.username = username;

    const authType = searchParams.get('auth_type');
    if (authType && ['credentials', 'cookie'].includes(authType)) {
      filters.auth_type = authType as 'credentials' | 'cookie';
    }

    const isLoggedIn = searchParams.get('is_logged_in');
    if (isLoggedIn !== null) {
      filters.is_logged_in = isLoggedIn === 'true';
    }

    const isMonitoring = searchParams.get('is_monitoring');
    if (isMonitoring !== null) {
      filters.is_monitoring = isMonitoring === 'true';
    }

    const autoReplyEnabled = searchParams.get('auto_reply_enabled');
    if (autoReplyEnabled !== null) {
      filters.auto_reply_enabled = autoReplyEnabled === 'true';
    }

    // Construir query do Supabase
    let query = supabase
      .from('instagram_accounts')
      .select('*')
      .eq('user_id', user.id);

    // Aplicar filtros
    if (filters.username) {
      query = query.ilike('username', `%${filters.username}%`);
    }
    if (filters.auth_type) {
      query = query.eq('auth_type', filters.auth_type);
    }
    if (filters.is_logged_in !== undefined) {
      query = query.eq('is_logged_in', filters.is_logged_in);
    }
    if (filters.is_monitoring !== undefined) {
      query = query.eq('is_monitoring', filters.is_monitoring);
    }
    if (filters.auto_reply_enabled !== undefined) {
      query = query.eq('auto_reply_enabled', filters.auto_reply_enabled);
    }

    // Executar query
    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar contas:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar contas' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Erro na API GET /instagram-accounts:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/instagram-accounts - Criar nova conta
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerSupabaseClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Extrair dados do corpo da requisição
    const body = await request.json();
    console.log('Dados recebidos:', body);
    
    // Preparar dados para criação
    const createData: CreateInstagramAccountData = {
      user_id: user.id, // Sempre usar o ID do usuário autenticado
      username: body.username,
      auth_type: body.auth_type,
      password: body.auth_type === 'credentials' ? body.password : null,
      monitor_keywords: body.monitor_keywords || null,
      auto_reply_enabled: body.auto_reply_enabled || false,
      auto_reply_message: body.auto_reply_message || null,
      cookie: body.cookie || null
    };
    
    console.log('Dados preparados para criação:', createData);

    // Validar dados obrigatórios
    if (!createData.username || !createData.auth_type) {
      return NextResponse.json(
        { error: 'Username e auth_type são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se username já existe para este usuário
    const { data: existingAccount } = await supabase
      .from('instagram_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('username', createData.username)
      .single();

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este username' },
        { status: 400 }
      );
    }

    // Criar conta no Supabase
    const { data, error } = await supabase
      .from('instagram_accounts')
      .insert([createData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar conta:', error);
      return NextResponse.json(
        { error: 'Erro ao criar conta' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    }, { status: 201 });
  } catch (error) {
    console.error('Erro na API POST /instagram-accounts:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}