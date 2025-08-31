import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/route-handler';
import { instagramAccountsService } from '@/lib/services/instagram-accounts';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT /api/instagram-accounts/[id]/login-status - Atualizar status de login
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    // Verificar se a conta existe e pertence ao usuário
    const existingAccount = await instagramAccountsService.getById(id);
    if (!existingAccount.success) {
      const status = existingAccount.error?.includes('não encontrada') ? 404 : 400;
      return NextResponse.json(
        { error: existingAccount.error },
        { status }
      );
    }

    if (existingAccount.data && existingAccount.data.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Extrair dados do corpo da requisição
    const body = await request.json();
    const { is_logged_in } = body;

    if (typeof is_logged_in !== 'boolean') {
      return NextResponse.json(
        { error: 'is_logged_in deve ser um valor booleano' },
        { status: 400 }
      );
    }

    // Atualizar status de login
    const result = await instagramAccountsService.updateLoginStatus(id, is_logged_in);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: `Status de login ${is_logged_in ? 'ativado' : 'desativado'} com sucesso`
    });
  } catch (error) {
    console.error('Erro na API PUT /instagram-accounts/[id]/login-status:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}