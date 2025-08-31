import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { accountId } = body;

    // Validar dados obrigatórios
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'AccountId é obrigatório' },
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

    // Atualizar status da conta no Supabase
    const { error: updateError } = await supabase
      .from('instagram_accounts')
      .update({
        is_logged_in: false,
        logout_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar conta:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erro ao fazer logout da conta' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      accountId,
      isLoggedIn: false,
      logoutTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no logout do Instagram:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}