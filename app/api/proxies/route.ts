import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

type ProxyType = 'http' | 'https' | 'socks5'
type ProxyStatus = 'active' | 'inactive' | 'error'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as ProxyStatus
    const type = searchParams.get('type') as ProxyType
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
      .from('proxies')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtrar por status se especificado
    if (status && ['active', 'inactive', 'error'].includes(status)) {
      query = query.eq('status', status)
    }

    // Filtrar por tipo se especificado
    if (type && ['http', 'https', 'socks5'].includes(type)) {
      query = query.eq('type', type)
    }

    const { data: proxies, error } = await query

    if (error) {
      console.error('Erro ao buscar proxies:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Buscar contagem total para paginação
    let countQuery = supabase
      .from('proxies')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)

    if (status && ['active', 'inactive', 'error'].includes(status)) {
      countQuery = countQuery.eq('status', status)
    }

    if (type && ['http', 'https', 'socks5'].includes(type)) {
      countQuery = countQuery.eq('type', type)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Erro ao contar proxies:', countError)
    }

    return NextResponse.json({ 
      proxies,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Erro na API de proxies:', error)
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
    const { 
      name, 
      host, 
      port, 
      type, 
      username, 
      password, 
      country, 
      city,
      settings 
    } = body

    // Validar dados obrigatórios
    if (!name || !host || !port || !type) {
      return NextResponse.json(
        { error: 'Nome, host, porta e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['http', 'https', 'socks5'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de proxy inválido' },
        { status: 400 }
      )
    }

    // Validar porta
    const portNumber = parseInt(port)
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      return NextResponse.json(
        { error: 'Porta deve ser um número entre 1 e 65535' },
        { status: 400 }
      )
    }

    // Verificar se já existe um proxy com o mesmo host e porta
    const { data: existingProxy } = await supabase
      .from('proxies')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('host', host)
      .eq('port', portNumber)
      .single()

    if (existingProxy) {
      return NextResponse.json(
        { error: 'Já existe um proxy com este host e porta' },
        { status: 409 }
      )
    }

    // Criar novo proxy
    const { data: proxy, error } = await supabase
      .from('proxies')
      .insert({
        user_id: session.user.id,
        name,
        host,
        port: portNumber,
        type,
        username,
        password,
        country,
        city,
        settings: settings || {},
        status: 'inactive', // Inicialmente inativo até ser testado
        last_check: null,
        response_time: null,
        uptime_percentage: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar proxy:', error)
      return NextResponse.json(
        { error: 'Erro ao criar proxy' },
        { status: 500 }
      )
    }

    return NextResponse.json({ proxy }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de proxies:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}