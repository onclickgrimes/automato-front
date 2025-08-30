'use client';

import { useEffect } from 'react';
import { useInstagram, useInstagramStats } from '../../lib/hooks/useInstagram';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface InstagramDashboardProps {
  className?: string;
}

export function InstagramDashboard({ className }: InstagramDashboardProps) {
  const { state, refreshStatus } = useInstagram();
  const { stats } = useInstagramStats();

  useEffect(() => {
    // Atualizar status a cada 30 segundos se estiver logado
    if (!state.isLoggedIn) return;

    const interval = setInterval(() => {
      refreshStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [state.isLoggedIn, refreshStatus]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connection Status */}
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              state.isLoggedIn ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-lg font-semibold">
                {state.isLoggedIn ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
          </div>
        </Card>

        {/* Monitoring Status */}
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              state.isMonitoring ? 'bg-blue-500' : 'bg-gray-400'
            }`} />
            <div>
              <p className="text-sm font-medium text-gray-600">Monitoramento</p>
              <p className="text-lg font-semibold">
                {state.isMonitoring ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
        </Card>

        {/* Total Actions */}
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Ações</p>
              <p className="text-lg font-semibold">{stats.totalActions}</p>
            </div>
          </div>
        </Card>

        {/* Success Rate */}
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
              <p className="text-lg font-semibold">
                {stats.totalActions > 0 
                  ? `${Math.round((stats.successfulActions / stats.totalActions) * 100)}%`
                  : '0%'
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Estatísticas de Atividade</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ações Bem-sucedidas</span>
              <span className="font-semibold text-green-600">{stats.successfulActions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ações Falharam</span>
              <span className="font-semibold text-red-600">{stats.failedActions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Ações</span>
              <span className="font-semibold">{stats.totalActions}</span>
            </div>
            {stats.lastAction && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Última Ação:</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium">{stats.lastAction.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.lastAction.timestamp.toLocaleString()}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                    stats.lastAction.success 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {stats.lastAction.success ? 'Sucesso' : 'Falha'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status do Sistema</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conexão Instagram</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                state.isLoggedIn 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {state.isLoggedIn ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monitoramento</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                state.isMonitoring 
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {state.isMonitoring ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sistema</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                state.isLoading 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {state.isLoading ? 'Processando' : 'Operacional'}
              </span>
            </div>
            
            {/* Error Display */}
            {state.error && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Último Erro:</p>
                <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                  <p className="text-sm text-red-600">{state.error}</p>
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={refreshStatus}
                disabled={state.isLoading}
                variant="outline"
                className="w-full"
              >
                {state.isLoading ? 'Atualizando...' : 'Atualizar Status'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      {state.isLoggedIn && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-blue-600">Curtir Posts</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-green-600">Comentários</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-purple-600">Seguir Usuários</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-orange-600">Publicar Fotos</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}