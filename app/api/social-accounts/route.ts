import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

type SocialAccountType = 'instagram' | 'whatsapp' | 'facebook'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as SocialAccountType
    
    // Verificar se o usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    let query = supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    // Filtrar por tipo se especificado
    if (type && ['instagram', 'whatsapp', 'facebook'].includes(type)) {
      query = query.eq('type', type)
    }

    const { data: accounts, error } = await query

    if (error) {
      console.error('Erro ao buscar contas sociais:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Erro na API de contas sociais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar se o usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, username, display_name, access_token, refresh_token, settings } = body

    // Validar dados obrigatórios
    if (!type || !username) {
      return NextResponse.json(
        { error: 'Tipo e nome de usuário são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['instagram', 'whatsapp', 'facebook'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de conta inválido' },
        { status: 400 }
      )
    }

    // Verificar se a conta já existe
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('type', type)
      .eq('username', username)
      .single()

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Esta conta já está cadastrada' },
        { status: 409 }
      )
    }

    // Criar nova conta social
    const { data: account, error } = await supabase
      .from('social_accounts')
      .insert({
        user_id: session.user.id,
        type,
        username,
        display_name,
        access_token,
        refresh_token,
        settings: settings || {},
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar conta social:', error)
      return NextResponse.json(
        { error: 'Erro ao criar conta social' },
        { status: 500 }
      )
    }

    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de contas sociais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}