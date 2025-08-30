import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    // Buscar estatísticas em paralelo
    const [socialAccountsResult, routinesResult, proxiesResult, executionLogsResult] = await Promise.all([
      // Contas sociais por tipo e status
      supabase
        .from('social_accounts')
        .select('type, status')
        .eq('user_id', session.user.id),
      
      // Rotinas por status
      supabase
        .from('routines')
        .select('status, created_at')
        .eq('user_id', session.user.id),
      
      // Proxies por status
      supabase
        .from('proxies')
        .select('status, response_time, uptime_percentage')
        .eq('user_id', session.user.id),
      
      // Logs de execução das últimas 24 horas
      supabase
        .from('execution_logs')
        .select('status, created_at, execution_time')
        .eq('user_id', session.user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100)
    ])

    // Processar contas sociais
    const socialAccounts = socialAccountsResult.data || []
    const socialAccountsStats = {
      total: socialAccounts.length,
      byType: {
        instagram: socialAccounts.filter(acc => acc.type === 'instagram').length,
        whatsapp: socialAccounts.filter(acc => acc.type === 'whatsapp').length,
        facebook: socialAccounts.filter(acc => acc.type === 'facebook').length
      },
      byStatus: {
        active: socialAccounts.filter(acc => acc.status === 'active').length,
        inactive: socialAccounts.filter(acc => acc.status === 'inactive').length,
        error: socialAccounts.filter(acc => acc.status === 'error').length
      }
    }

    // Processar rotinas
    const routines = routinesResult.data || []
    const routinesStats = {
      total: routines.length,
      active: routines.filter(routine => routine.status === 'active').length,
      inactive: routines.filter(routine => routine.status === 'inactive').length,
      paused: routines.filter(routine => routine.status === 'paused').length,
      createdThisMonth: routines.filter(routine => {
        const createdAt = new Date(routine.created_at)
        const now = new Date()
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
      }).length
    }

    // Processar proxies
    const proxies = proxiesResult.data || []
    const activeProxies = proxies.filter(proxy => proxy.status === 'active')
    const avgResponseTime = activeProxies.length > 0 
      ? Math.round(activeProxies.reduce((sum, proxy) => sum + (proxy.response_time || 0), 0) / activeProxies.length)
      : 0
    const avgUptime = proxies.length > 0
      ? Math.round(proxies.reduce((sum, proxy) => sum + (proxy.uptime_percentage || 0), 0) / proxies.length * 10) / 10
      : 0

    const proxiesStats = {
      total: proxies.length,
      active: activeProxies.length,
      inactive: proxies.filter(proxy => proxy.status === 'inactive').length,
      error: proxies.filter(proxy => proxy.status === 'error').length,
      avgResponseTime,
      avgUptime
    }

    // Processar logs de execução
    const executionLogs = executionLogsResult.data || []
    const successfulExecutions = executionLogs.filter(log => log.status === 'success')
    const failedExecutions = executionLogs.filter(log => log.status === 'error')
    const avgExecutionTime = successfulExecutions.length > 0
      ? Math.round(successfulExecutions.reduce((sum, log) => sum + (log.execution_time || 0), 0) / successfulExecutions.length)
      : 0

    const executionStats = {
      total24h: executionLogs.length,
      successful: successfulExecutions.length,
      failed: failedExecutions.length,
      successRate: executionLogs.length > 0 
        ? Math.round((successfulExecutions.length / executionLogs.length) * 100)
        : 0,
      avgExecutionTime
    }

    // Dados para gráficos (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    const dailyExecutions = last7Days.map(date => {
      const dayLogs = executionLogs.filter(log => 
        log.created_at.startsWith(date)
      )
      return {
        date,
        total: dayLogs.length,
        successful: dayLogs.filter(log => log.status === 'success').length,
        failed: dayLogs.filter(log => log.status === 'error').length
      }
    })

    // Atividades recentes (últimas 10)
    const recentActivities = executionLogs.slice(0, 10).map(log => ({
      id: log.id || Math.random().toString(),
      type: log.status === 'success' ? 'success' : 'error',
      message: log.status === 'success' 
        ? 'Automação executada com sucesso'
        : 'Falha na execução da automação',
      timestamp: log.created_at,
      executionTime: log.execution_time
    }))

    const stats = {
      socialAccounts: socialAccountsStats,
      routines: routinesStats,
      proxies: proxiesStats,
      executions: executionStats,
      charts: {
        dailyExecutions
      },
      recentActivities,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Erro na API de estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}