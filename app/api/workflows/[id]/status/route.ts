import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
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

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
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

    // Fazer chamada para o backend real para obter o status
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/instagram/workflow/status/${workflowId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Backend error' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to get workflow status' },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();

    // Buscar logs de execução locais para complementar informações
    const { data: executionLogs, error: logsError } = await supabaseClient.from('execution_logs')
      .select('*')
      .eq('routine_id', workflowId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('Error fetching execution logs:', logsError);
    }

    return NextResponse.json({
      success: true,
      workflow: {
        id: workflowId,
        name: workflow.workflow?.name || 'Unnamed Workflow',
        ...result
      },
      execution_logs: executionLogs || [],
      ...result
    });

  } catch (error) {
    console.error('Error getting workflow status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}