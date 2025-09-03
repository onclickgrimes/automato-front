import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const workflowId = (await params).id;
    console.log('workflowId', workflowId);
    const body = await request.json();
    const { account_id } = body;
    console.log('account_id', account_id);
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


    // const isLogged = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/instagram/status/olavodecarvalho.ia`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   }
    // })

    // const isLoggedData = await isLogged.json();
    // console.log('isLoggedData', isLoggedData);
    // if (!isLoggedData.is_logged_in) {
    //   return NextResponse.json(
    //     { error: 'A conta do Instagram deve estar logada para executar workflows' },
    //     { status: 400 }
    //   );
    // }

    // console.log('workflow', JSON.stringify(workflow.workflow));
    // Fazer chamada para o backend real
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/instagram/workflow/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...workflow,
        instanceName: account.username
      })
    });
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Backend error' }));
      return NextResponse.json(
        { error: errorData.error || 'Failed to start workflow' },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();

    // Criar registro de execução
    const { data: execution, error: executionError } = await supabase
      .from('execution_logs')
      .insert({
        user_id: session.user.id,
        routine_id: null, // Para workflows, não temos routine_id
        social_account_id: account_id,
        action_type: 'workflow_execution',
        status: 'running',
        result: {
          workflow_id: workflowId,
          workflow_name: workflow.workflow?.name || 'Workflow sem nome',
          started_by: 'manual',
          ...result
        }
      })
      .select()
      .single();

    if (executionError) {
      console.error('Erro ao criar log de execução:', executionError);
    }

    return NextResponse.json({
      success: true,
      data: {
        execution_id: execution?.id,
        workflow_id: workflowId,
        account_id: account_id,
        status: 'running',
        message: 'Workflow iniciado com sucesso',
        ...result
      }
    });

  } catch (error) {
    console.error('Erro na API de iniciar workflow:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}