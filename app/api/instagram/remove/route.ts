import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';


export async function DELETE(request: NextRequest) {
  try {
    // Criar cliente Supabase com cookies para autenticação
    const supabase = await createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Obter o accountId da URL ou do corpo da requisição
    const url = new URL(request.url);
    const accountId = url.searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'ID da conta é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🗑️ Removendo conta do Instagram:', { accountId, userId: user.id });

    // Remover a conta do Supabase
    const { error: deleteError } = await supabase
      .from('instagram_accounts')
      .delete()
      .eq('user_id', user.id)
      .eq('id', accountId);

    if (deleteError) {
      console.error('❌ Erro ao remover conta do Supabase:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Erro ao remover conta do banco de dados' },
        { status: 500 }
      );
    }

    console.log('✅ Conta removida com sucesso do Supabase');

    return NextResponse.json({
      success: true,
      message: 'Conta removida com sucesso',
      data: { accountId }
    });

  } catch (error) {
    console.error('❌ Erro interno ao remover conta:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}