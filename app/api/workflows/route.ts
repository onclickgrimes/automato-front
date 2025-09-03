import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado', details: sessionError?.message },
        { status: 401 }
      );
    }

    console.log('Usuário autenticado:', session.user.id);

    // Buscar workflows locais
    const { data: localWorkflows, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar workflows locais:', error);
    }

    // Tentar buscar workflows do backend também
    let backendWorkflows = [];
    try {
      const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/instagram/workflow/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // Se o backend precisar de autenticação
        }
      });

      if (backendResponse.ok) {
        const backendResult = await backendResponse.json();
        backendWorkflows = backendResult.workflows || backendResult.data || [];
      }
    } catch (backendError) {
      console.error('Erro ao buscar workflows do backend:', backendError);
      // Continua com workflows locais se o backend falhar
    }

    // Combinar dados locais com informações do backend
    const combinedWorkflows = (localWorkflows || []).map(localWorkflow => {
      const backendWorkflow = backendWorkflows.find(bw => bw.id === localWorkflow.id);
      return {
        ...localWorkflow,
        backend_status: backendWorkflow?.status || 'unknown',
        backend_info: backendWorkflow || null
      };
    });

    return NextResponse.json({
      success: true,
      data: combinedWorkflows,
      count: combinedWorkflows.length,
      backend_available: backendWorkflows.length > 0
    });
  } catch (error) {
    console.error('Erro na API workflows:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { workflow } = body;

    if (!workflow || !workflow.id || !workflow.name) {
      return NextResponse.json(
        { error: 'Dados do workflow inválidos' },
        { status: 400 }
      );
    }

    // Inserir ou atualizar workflow
    const { data, error } = await supabase
      .from('workflows')
      .upsert({
        id: workflow.id,
        user_id: session.user.id,
        workflow: workflow
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao salvar workflow', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Erro na API workflows POST:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}