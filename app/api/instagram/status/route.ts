import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    let query = supabase
      .from('instagram_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (accountId) {
      query = query.eq('id', accountId);
    }

    const { data: accounts, error: fetchError } = await query;

    if (fetchError) {
      console.error('Erro ao buscar contas:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar informações das contas' },
        { status: 500 }
      );
    }

    // Simular dados de status em tempo real
    const accountsWithStatus = accounts?.map(account => ({
      id: account.id,
      username: account.username,
      isLoggedIn: account.is_logged_in,
      isMonitoring: account.is_logged_in && Math.random() > 0.3, // Simular monitoramento
      lastActivity: account.updated_at,
      profile: account.profile_data,
      stats: {
        messagesReceived: Math.floor(Math.random() * 50),
        messagesReplied: Math.floor(Math.random() * 30),
        likesGiven: Math.floor(Math.random() * 100),
        commentsPosted: Math.floor(Math.random() * 20),
        followersGained: Math.floor(Math.random() * 10),
        followersLost: Math.floor(Math.random() * 5)
      }
    })) || [];

    if (accountId) {
      const account = accountsWithStatus[0];
      if (!account) {
        return NextResponse.json(
          { success: false, error: 'Conta não encontrada' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, account });
    }

    return NextResponse.json({ 
      success: true, 
      accounts: accountsWithStatus 
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}