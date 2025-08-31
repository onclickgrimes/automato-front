import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { action, accountId, targetUrl, targetUsername, comment, photoFile } = body;

    // Validar dados obrigatórios
    if (!action || !accountId) {
      return NextResponse.json(
        { success: false, error: 'Action e accountId são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se a conta existe e está logada
    const { data: account, error: accountError } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { success: false, error: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    if (!account.is_logged_in) {
      return NextResponse.json(
        { success: false, error: 'Conta não está logada' },
        { status: 400 }
      );
    }

    // Simular execução da ação
    let result;
    const timestamp = new Date().toISOString();

    switch (action) {
      case 'like':
        if (!targetUrl) {
          return NextResponse.json(
            { success: false, error: 'URL do post é obrigatória para curtir' },
            { status: 400 }
          );
        }
        result = {
          success: true,
          action: 'like',
          accountId,
          targetUrl,
          timestamp,
          message: 'Post curtido com sucesso'
        };
        break;

      case 'comment':
        if (!targetUrl || !comment) {
          return NextResponse.json(
            { success: false, error: 'URL do post e comentário são obrigatórios' },
            { status: 400 }
          );
        }
        result = {
          success: true,
          action: 'comment',
          accountId,
          targetUrl,
          comment,
          timestamp,
          message: 'Comentário postado com sucesso'
        };
        break;

      case 'follow':
        if (!targetUsername) {
          return NextResponse.json(
            { success: false, error: 'Username é obrigatório para seguir' },
            { status: 400 }
          );
        }
        result = {
          success: true,
          action: 'follow',
          accountId,
          targetUsername,
          timestamp,
          message: `Agora seguindo @${targetUsername}`
        };
        break;

      case 'unfollow':
        if (!targetUsername) {
          return NextResponse.json(
            { success: false, error: 'Username é obrigatório para deixar de seguir' },
            { status: 400 }
          );
        }
        result = {
          success: true,
          action: 'unfollow',
          accountId,
          targetUsername,
          timestamp,
          message: `Deixou de seguir @${targetUsername}`
        };
        break;

      case 'upload':
        if (!photoFile) {
          return NextResponse.json(
            { success: false, error: 'Arquivo de foto é obrigatório para upload' },
            { status: 400 }
          );
        }
        result = {
          success: true,
          action: 'upload',
          accountId,
          photoFile,
          timestamp,
          message: 'Foto enviada com sucesso'
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }

    // Registrar a ação no banco de dados
    const { error: logError } = await supabase
      .from('instagram_actions')
      .insert({
        user_id: user.id,
        account_id: accountId,
        action_type: action,
        target_url: targetUrl,
        target_username: targetUsername,
        comment_text: comment,
        result: result,
        created_at: timestamp
      });

    if (logError) {
      console.error('Erro ao registrar ação:', logError);
      // Não falhar a requisição por erro de log
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na ação do Instagram:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}