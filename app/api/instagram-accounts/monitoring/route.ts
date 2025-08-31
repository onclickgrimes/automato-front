import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/route-handler';
import { instagramAccountsService } from '@/lib/services/instagram-accounts';

// GET /api/instagram-accounts/monitoring - Buscar contas em monitoramento
export async function GET(request: NextRequest) {
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

    // Buscar contas em monitoramento do usuário
    const result = await instagramAccountsService.getMonitoringAccounts(user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.count
    });
  } catch (error) {
    console.error('Erro na API GET /instagram-accounts/monitoring:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}