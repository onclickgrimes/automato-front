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

    // Tentar buscar workflows
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    console.log('Resultado da consulta workflows:', { data, error });

    if (error) {
      return NextResponse.json(
        { error: 'Erro na consulta', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
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