import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type TriggerType = 'schedule' | 'webhook' | 'manual'
type RoutineStatus = 'active' | 'inactive' | 'paused'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as RoutineStatus
    const socialAccountId = searchParams.get('social_account_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Verificar se o usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    let query = supabase
      .from('routines')
      .select(`
        *,
        social_accounts (
          id,
          type,
          username,
          display_name
        ),
        proxies (
          id,
          name,
          host,
          port
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtrar por status se especificado
    if (status && ['active', 'inactive', 'paused'].includes(status)) {
      query = query.eq('status', status)
    }

    // Filtrar por conta social se especificado
    if (socialAccountId) {
      query = query.eq('social_account_id', socialAccountId)
    }

    const { data: routines, error } = await query

    if (error) {
      console.error('Erro ao buscar rotinas:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Buscar contagem total para paginação
    let countQuery = supabase
      .from('routines')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)

    if (status && ['active', 'inactive', 'paused'].includes(status)) {
      countQuery = countQuery.eq('status', status)
    }

    if (socialAccountId) {
      countQuery = countQuery.eq('social_account_id', socialAccountId)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Erro ao contar rotinas:', countError)
    }

    return NextResponse.json({ 
      routines,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Erro na API de rotinas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const { 
      name, 
      description, 
      social_account_id, 
      proxy_id,
      trigger_type, 
      trigger_config, 
      actions, 
      settings 
    } = body

    // Validar dados obrigatórios
    if (!name || !social_account_id || !trigger_type || !actions) {
      return NextResponse.json(
        { error: 'Nome, conta social, tipo de trigger e ações são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['schedule', 'webhook', 'manual'].includes(trigger_type)) {
      return NextResponse.json(
        { error: 'Tipo de trigger inválido' },
        { status: 400 }
      )
    }

    // Verificar se a conta social pertence ao usuário
    const { data: socialAccount, error: socialAccountError } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('id', social_account_id)
      .eq('user_id', session.user.id)
      .single()

    if (socialAccountError) {
      return NextResponse.json(
        { error: 'Conta social não encontrada ou não autorizada' },
        { status: 404 }
      )
    }

    // Verificar se o proxy pertence ao usuário (se especificado)
    if (proxy_id) {
      const { data: proxy, error: proxyError } = await supabase
        .from('proxies')
        .select('id')
        .eq('id', proxy_id)
        .eq('user_id', session.user.id)
        .single()

      if (proxyError) {
        return NextResponse.json(
          { error: 'Proxy não encontrado ou não autorizado' },
          { status: 404 }
        )
      }
    }

    // Criar nova rotina
    const { data: routine, error } = await supabase
      .from('routines')
      .insert({
        user_id: session.user.id,
        name,
        description,
        social_account_id,
        proxy_id,
        trigger_type,
        trigger_config: trigger_config || {},
        actions,
        settings: settings || {},
        status: 'active'
      })
      .select(`
        *,
        social_accounts (
          id,
          type,
          username,
          display_name
        ),
        proxies (
          id,
          name,
          host,
          port
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao criar rotina:', error)
      return NextResponse.json(
        { error: 'Erro ao criar rotina' },
        { status: 500 }
      )
    }

    return NextResponse.json({ routine }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de rotinas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}