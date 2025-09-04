import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: workflowId } = await params;
    const body = await request.json();
    const { favorite } = body;

    if (typeof favorite !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo favorite deve ser um boolean' },
        { status: 400 }
      );
    }

    // Verificar se o workflow pertence ao usuário
    const { data: existingWorkflow, error: checkError } = await supabase
      .from('workflows')
      .select('id')
      .eq('id', workflowId)
      .eq('user_id', session.user.id)
      .single();

    if (checkError || !existingWorkflow) {
      return NextResponse.json(
        { error: 'Workflow não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar o status de favorito
    const { data, error } = await supabase
      .from('workflows')
      .update({ favorite })
      .eq('id', workflowId)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar favorito:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar favorito', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: favorite ? 'Workflow adicionado aos favoritos' : 'Workflow removido dos favoritos'
    });
  } catch (error) {
    console.error('Erro na API de favoritos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}