import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { username, password, cookies: loginCookies, authType, accountId } = body;

    // Validar dados obrigatórios
    if (!username || !accountId) {
      return NextResponse.json(
        { success: false, error: 'Username e accountId são obrigatórios' },
        { status: 400 }
      );
    }

    if (authType === 'credentials' && !password) {
      return NextResponse.json(
        { success: false, error: 'Password é obrigatório para login com credenciais' },
        { status: 400 }
      );
    }

    if (authType === 'cookies' && !loginCookies) {
      return NextResponse.json(
        { success: false, error: 'Cookies são obrigatórios para login com cookies' },
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

    // Simular processo de login do Instagram
    // Em uma implementação real, aqui você faria a integração com a API do Instagram
    const loginResult = {
      success: true,
      accountId,
      username,
      isLoggedIn: true,
      loginMethod: authType,
      loginTime: new Date().toISOString(),
      profile: {
        username,
        fullName: `${username} Profile`,
        profilePicture: `https://via.placeholder.com/150?text=${username}`,
        followersCount: Math.floor(Math.random() * 10000),
        followingCount: Math.floor(Math.random() * 1000),
        postsCount: Math.floor(Math.random() * 500)
      }
    };

    // Salvar informações da conta no Supabase
    const { error: insertError } = await supabase
      .from('instagram_accounts')
      .upsert({
        id: accountId,
        user_id: user.id,
        username,
        auth_type: authType,
        is_logged_in: true,
        login_time: new Date().toISOString(),
        profile_data: loginResult.profile,
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Erro ao salvar conta:', insertError);
      return NextResponse.json(
        { success: false, error: 'Erro ao salvar informações da conta' },
        { status: 500 }
      );
    }

    return NextResponse.json(loginResult);
  } catch (error) {
    console.error('Erro no login do Instagram:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}