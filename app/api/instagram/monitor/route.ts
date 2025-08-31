import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { action, accountId, keywords, autoReply, replyMessage } = body;

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

    const timestamp = new Date().toISOString();
    let result;

    if (action === 'start') {
      // Iniciar monitoramento
      if (keywords && keywords.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Pelo menos uma palavra-chave é necessária' },
          { status: 400 }
        );
      }

      // Atualizar configurações de monitoramento no banco
      const { error: updateError } = await supabase
        .from('instagram_accounts')
        .update({
          is_monitoring: true,
          monitor_keywords: keywords,
          auto_reply_enabled: autoReply || false,
          auto_reply_message: replyMessage,
          monitor_started_at: timestamp,
          updated_at: timestamp
        })
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Erro ao iniciar monitoramento:', updateError);
        return NextResponse.json(
          { success: false, error: 'Erro ao iniciar monitoramento' },
          { status: 500 }
        );
      }

      result = {
        success: true,
        action: 'start',
        accountId,
        isMonitoring: true,
        keywords,
        autoReply,
        replyMessage,
        startedAt: timestamp,
        message: 'Monitoramento iniciado com sucesso'
      };
    } else if (action === 'stop') {
      // Parar monitoramento
      const { error: updateError } = await supabase
        .from('instagram_accounts')
        .update({
          is_monitoring: false,
          monitor_stopped_at: timestamp,
          updated_at: timestamp
        })
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Erro ao parar monitoramento:', updateError);
        return NextResponse.json(
          { success: false, error: 'Erro ao parar monitoramento' },
          { status: 500 }
        );
      }

      result = {
        success: true,
        action: 'stop',
        accountId,
        isMonitoring: false,
        stoppedAt: timestamp,
        message: 'Monitoramento parado com sucesso'
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'Ação não reconhecida. Use "start" ou "stop"' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro no monitoramento do Instagram:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

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

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'AccountId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar mensagens simuladas para a conta
    const messages = [
      {
        id: '1',
        sender: 'user123',
        message: 'Olá! Gostei muito do seu post sobre viagem!',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min atrás
        isRead: false,
        containsKeyword: true,
        keyword: 'viagem'
      },
      {
        id: '2',
        sender: 'user456',
        message: 'Você tem produtos disponíveis?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min atrás
        isRead: true,
        containsKeyword: true,
        keyword: 'produtos'
      },
      {
        id: '3',
        sender: 'user789',
        message: 'Parabéns pelo conteúdo!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
        isRead: true,
        containsKeyword: false
      }
    ];

    return NextResponse.json({
      success: true,
      accountId,
      messages,
      totalMessages: messages.length,
      unreadMessages: messages.filter(m => !m.isRead).length
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}