import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const workflowId = params.id;
    const body = await request.json();
    const { account_id } = body;

    if (!account_id) {
      return NextResponse.json(
        { error: 'ID da conta é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o workflow existe e pertence ao usuário
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', session.user.id)
      .single();

    if (workflowError || !workflow) {
      return NextResponse.json(
        { error: 'Workflow não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se a conta do Instagram pertence ao usuário
    const { data: account, error: accountError } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('id', account_id)
      .eq('user_id', session.user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Conta do Instagram não encontrada' },
        { status: 404 }
      );
    }

    // Buscar execuções em andamento para este workflow e conta
    const { data: runningExecutions, error: executionsError } = await supabase
      .from('execution_logs')
      .select('*')
      .eq('social_account_id', account_id)
      .eq('status', 'running')
      .contains('result', { workflow_id: workflowId });

    if (executionsError) {
      console.error('Erro ao buscar execuções:', executionsError);
      return NextResponse.json(
        { error: 'Erro ao verificar execuções em andamento' },
        { status: 500 }
      );
    }

    if (!runningExecutions || runningExecutions.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma execução em andamento encontrada para este workflow' },
        { status: 404 }
      );
    }

    // Parar todas as execuções em andamento
    const stoppedExecutions = [];
    for (const execution of runningExecutions) {
      const { data: stoppedExecution, error: stopError } = await supabase
        .from('execution_logs')
        .update({
          status: 'stopped',
          completed_at: new Date().toISOString(),
          result: {
            ...execution.result,
            stopped_at: new Date().toISOString(),
            stopped_by: 'manual',
            reason: 'Parado pelo usuário'
          }
        })
        .eq('id', execution.id)
        .select()
        .single();

      if (stopError) {
        console.error('Erro ao parar execução:', stopError);
      } else {
        stoppedExecutions.push(stoppedExecution);
      }
    }

    // TODO: Aqui você pode implementar a lógica real para parar a execução do workflow
    // Por exemplo, cancelar processos em andamento, limpar recursos, etc.
    console.log(`Parando workflow ${workflowId} para conta ${account_id}`);
    console.log('Execuções paradas:', stoppedExecutions.length);

    return NextResponse.json({
      success: true,
      data: {
        workflow_id: workflowId,
        account_id: account_id,
        stopped_executions: stoppedExecutions.length,
        status: 'stopped',
        message: 'Workflow parado com sucesso'
      }
    });

  } catch (error) {
    console.error('Erro na API de parar workflow:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}