import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verificar se o usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { data: account, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Conta não encontrada' },
          { status: 404 }
        )
      }
      console.error('Erro ao buscar conta social:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Erro na API de conta social:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verificar se o usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { display_name, access_token, refresh_token, settings, status } = body

    // Verificar se a conta existe e pertence ao usuário
    const { data: existingAccount, error: checkError } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Conta não encontrada' },
          { status: 404 }
        )
      }
      console.error('Erro ao verificar conta:', checkError)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Atualizar a conta social
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (display_name !== undefined) updateData.display_name = display_name
    if (access_token !== undefined) updateData.access_token = access_token
    if (refresh_token !== undefined) updateData.refresh_token = refresh_token
    if (settings !== undefined) updateData.settings = settings
    if (status !== undefined) {
      if (!['active', 'inactive', 'error'].includes(status)) {
        return NextResponse.json(
          { error: 'Status inválido' },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    const { data: account, error } = await supabase
      .from('social_accounts')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar conta social:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar conta social' },
        { status: 500 }
      )
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Erro na API de conta social:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verificar se o usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se a conta existe e pertence ao usuário
    const { data: existingAccount, error: checkError } = await supabase
      .from('social_accounts')
      .select('id, type, username')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Conta não encontrada' },
          { status: 404 }
        )
      }
      console.error('Erro ao verificar conta:', checkError)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Verificar se existem rotinas ativas usando esta conta
    const { data: activeRoutines, error: routinesError } = await supabase
      .from('routines')
      .select('id, name')
      .eq('user_id', session.user.id)
      .eq('social_account_id', params.id)
      .eq('status', 'active')

    if (routinesError) {
      console.error('Erro ao verificar rotinas:', routinesError)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    if (activeRoutines && activeRoutines.length > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível excluir esta conta pois existem rotinas ativas associadas',
          activeRoutines: activeRoutines.map(r => r.name)
        },
        { status: 409 }
      )
    }

    // Deletar a conta social
    const { error } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Erro ao deletar conta social:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar conta social' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Conta social deletada com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro na API de conta social:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}