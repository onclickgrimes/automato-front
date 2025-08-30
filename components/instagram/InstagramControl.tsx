'use client';

import { useState } from 'react';
import { useInstagram } from '../../lib/hooks/useInstagram';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';

interface InstagramControlProps {
  className?: string;
}

export function InstagramControl({ className }: InstagramControlProps) {
  const { state, login, logout, startMonitoring, stopMonitoring, refreshStatus } = useInstagram();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) return;
    
    setIsSubmitting(true);
    try {
      await login(credentials);
      setCredentials({ username: '', password: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await logout();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMonitoring = async () => {
    setIsSubmitting(true);
    try {
      if (state.isMonitoring) {
        await stopMonitoring();
      } else {
        await startMonitoring({
          checkInterval: 30000,
          includeRequests: true
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Controle do Instagram</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              state.isLoggedIn ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-600">
              {state.isLoggedIn ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        {/* Status */}
        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
        )}

        {/* Login Form */}
        {!state.isLoggedIn && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Usuário do Instagram</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Digite seu usuário"
                disabled={isSubmitting || state.isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Digite sua senha"
                disabled={isSubmitting || state.isLoading}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || state.isLoading || !credentials.username || !credentials.password}
            >
              {isSubmitting || state.isLoading ? 'Conectando...' : 'Conectar'}
            </Button>
          </form>
        )}

        {/* Controls */}
        {state.isLoggedIn && (
          <div className="space-y-4">
            {/* Monitoring Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium">Monitoramento de Mensagens</p>
                <p className="text-sm text-gray-600">
                  {state.isMonitoring ? 'Ativo - Monitorando novas mensagens' : 'Inativo'}
                </p>
              </div>
              <Button
                onClick={handleToggleMonitoring}
                disabled={isSubmitting || state.isLoading}
                variant={state.isMonitoring ? 'destructive' : 'default'}
              >
                {state.isMonitoring ? 'Parar' : 'Iniciar'}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                onClick={refreshStatus}
                disabled={isSubmitting || state.isLoading}
                variant="outline"
                className="flex-1"
              >
                Atualizar Status
              </Button>
              <Button
                onClick={handleLogout}
                disabled={isSubmitting || state.isLoading}
                variant="destructive"
                className="flex-1"
              >
                {isSubmitting ? 'Desconectando...' : 'Desconectar'}
              </Button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {state.isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Carregando...</span>
          </div>
        )}
      </div>
    </Card>
  );
}