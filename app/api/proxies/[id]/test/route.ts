import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Função para testar conectividade do proxy
async function testProxyConnectivity(proxy: any): Promise<{
  success: boolean
  responseTime?: number
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    // Simular teste de conectividade
    // Em um ambiente real, você faria uma requisição HTTP através do proxy
    // Para este exemplo, vamos simular com um delay aleatório
    
    const simulatedDelay = Math.random() * 500 + 50 // 50-550ms
    await new Promise(resolve => setTimeout(resolve, simulatedDelay))
    
    // Simular falha ocasional baseada no status atual
    const shouldFail = proxy.status === 'error' || Math.random() < 0.1
    
    if (shouldFail) {
      throw new Error('Conexão recusada')
    }
    
    const responseTime = Date.now() - startTime
    
    return {
      success: true,
      responseTime
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

export async function POST(
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

    // Buscar o proxy
    const { data: proxy, error: proxyError } = await supabase
      .from('proxies')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (proxyError) {
      if (proxyError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Proxy não encontrado' },
          { status: 404 }
        )
      }
      console.error('Erro ao buscar proxy:', proxyError)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Testar conectividade do proxy
    const testResult = await testProxyConnectivity(proxy)
    
    // Atualizar status do proxy baseado no resultado do teste
    const updateData: any = {
      last_check: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (testResult.success) {
      updateData.status = 'active'
      updateData.response_time = testResult.responseTime
      
      // Calcular uptime (simplificado)
      const currentUptime = proxy.uptime_percentage || 0
      updateData.uptime_percentage = Math.min(100, currentUptime + 1)
    } else {
      updateData.status = 'error'
      updateData.response_time = null
      
      // Reduzir uptime em caso de falha
      const currentUptime = proxy.uptime_percentage || 0
      updateData.uptime_percentage = Math.max(0, currentUptime - 5)
    }

    // Atualizar proxy no banco
    const { data: updatedProxy, error: updateError } = await supabase
      .from('proxies')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar proxy:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar status do proxy' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      proxy: updatedProxy,
      testResult: {
        success: testResult.success,
        responseTime: testResult.responseTime,
        error: testResult.error,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Erro na API de teste de proxy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}