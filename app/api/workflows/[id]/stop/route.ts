import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }>}) {
  try {
    const supabase = createClient();
    const supabaseClient = await supabase;
    const { data: { session }, error: authError } = await supabaseClient.auth.getSession();

    if (authError || !session) {  
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: workflowId } = await params;
    const { account_id } = await request.json();

    if (!workflowId || !account_id) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID and Account ID are required' },
        { status: 400 }
      );
    }

    // Verificar se o workflow pertence ao usuário
    const { data: workflow, error: workflowError } = await supabaseClient
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', session.user.id)
      .single();

    if (workflowError || !workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Verificar se a conta pertence ao usuário
    const { data: account, error: accountError } = await supabaseClient
      .from('instagram_accounts')
      .select('*')
      .eq('id', account_id)
      .eq('user_id', session.user.id) 
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { success: false, error: 'Instagram account not found' },
        { status: 404 }
      );
    }

    // Fazer chamada para o backend real para parar o workflow
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/instagram/workflow/stop/${workflowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_id: account_id
      })
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Backend error' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to stop workflow' },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();

    // Buscar execuções em andamento para atualizar no banco local
    const { data: runningExecutions, error: executionsError } = await supabaseClient
      .from('execution_logs')
      .select('*')
      .eq('routine_id', workflowId)
      .eq('social_account_id', account_id)
      .eq('status', 'running');

    if (!executionsError && runningExecutions && runningExecutions.length > 0) {
      // Atualizar status das execuções para 'stopped'
      const executionIds = runningExecutions.map(exec => exec.id);
      await supabaseClient
        .from('execution_logs')
        .update({
          status: 'stopped',
          completed_at: new Date().toISOString(),
          result: {
            ...runningExecutions[0].result,
            stopped_at: new Date().toISOString(),
            stopped_by: 'manual',
            ...result
          }
        })
        .in('id', executionIds);
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow stopped successfully',
      ...result
    });

  } catch (error) {
    console.error('Error stopping workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}