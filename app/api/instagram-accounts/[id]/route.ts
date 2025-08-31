import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/route-handler';
import { UpdateInstagramAccountData } from '@/lib/types/instagram-accounts';

// GET /api/instagram-accounts/[id] - Buscar conta específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerSupabaseClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Buscar conta específica
    const { data, error } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // Garantir que o usuário só acesse suas próprias contas
      .single();

    if (error) {
      console.error('Erro ao buscar conta:', error);
      return NextResponse.json(
        { error: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Erro na API GET /instagram-accounts/[id]:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/instagram-accounts/[id] - Atualizar conta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerSupabaseClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar se a conta existe e pertence ao usuário
    const { data: existingAccount, error: checkError } = await supabase
      .from('instagram_accounts')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingAccount) {
      return NextResponse.json(
        { error: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    // Preparar dados para atualização (remover campos que não devem ser atualizados)
    const updateData: UpdateInstagramAccountData = {
      ...body,
      updated_at: new Date().toISOString()
    };
    
    // Incluir cookies no profile_data se fornecido
    if (body.cookies) {
      updateData.profile_data = {
        ...updateData.profile_data,
        cookies: body.cookies
      };
    }
    
    // Incluir password apenas se auth_type for 'credentials'
    if (body.auth_type === 'credentials' && body.password) {
      updateData.password = body.password;
    }

    // Remover campos que não devem ser atualizados pelo usuário
    delete (updateData as any).id;
    delete (updateData as any).user_id;
    delete (updateData as any).created_at;
    delete (updateData as any).cookies; // Cookies são salvos no profile_data

    // Se estiver tentando atualizar o username, verificar se já existe
    if (updateData.username) {
      const { data: duplicateAccount } = await supabase
        .from('instagram_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('username', updateData.username)
        .neq('id', id)
        .single();

      if (duplicateAccount) {
        return NextResponse.json(
          { error: 'Já existe uma conta com este username' },
          { status: 400 }
        );
      }
    }

    // Atualizar conta
    const { data, error } = await supabase
      .from('instagram_accounts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar conta:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar conta' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Erro na API PUT /instagram-accounts/[id]:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/instagram-accounts/[id] - Excluir conta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerSupabaseClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar se a conta existe e pertence ao usuário
    const { data: existingAccount, error: checkError } = await supabase
      .from('instagram_accounts')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingAccount) {
      return NextResponse.json(
        { error: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    // Excluir conta
    const { error } = await supabase
      .from('instagram_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao excluir conta:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir conta' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conta excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro na API DELETE /instagram-accounts/[id]:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}