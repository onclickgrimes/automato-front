'use client';

import { useState } from 'react';
import { useInstagram } from '../../lib/hooks/useInstagram';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { InstagramAccountManager } from './InstagramAccountManager';
import { User, Eye, EyeOff } from 'lucide-react';

interface InstagramControlProps {
  className?: string;
}

export function InstagramControl({ className }: InstagramControlProps) {
  const { 
    state, 
    login, 
    logout, 
    startMonitoring, 
    stopMonitoring, 
    refreshStatus,
    getActiveAccount,
    switchAccount
  } = useInstagram();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAccountManager, setShowAccountManager] = useState(false);

  const activeAccount = getActiveAccount();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password || !activeAccount) return;
    
    setIsSubmitting(true);
    try {
      await login({
        username: credentials.username,
        authType: 'credentials',
        authData: {
          username: credentials.username,
          password: credentials.password
        },
        accountId: activeAccount.id
      });
      setCredentials({ username: '', password: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!activeAccount) return;
    
    setIsSubmitting(true);
    try {
      await logout(activeAccount.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMonitoring = async () => {
    if (!activeAccount) return;
    
    setIsSubmitting(true);
    try {
      if (activeAccount.isMonitoring) {
        await stopMonitoring(activeAccount.id);
      } else {
        await startMonitoring({
          checkInterval: 30000,
          includeRequests: true,
          accountId: activeAccount.id
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Account Manager Toggle */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => setShowAccountManager(!showAccountManager)}
        >
          <User className="w-4 h-4 mr-2" />
          {showAccountManager ? 'Ocultar' : 'Gerenciar'} Contas
        </Button>
        
        {state.accounts.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Contas: {state.accounts.length}</span>
            <Badge variant={activeAccount?.isLoggedIn ? 'default' : 'secondary'}>
              {activeAccount?.isLoggedIn ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        )}
      </div>

      {/* Account Manager */}
      {showAccountManager && <InstagramAccountManager />}

      {/* Main Control Card */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Controle do Instagram</h3>
            <div className="flex items-center space-x-2">
              {activeAccount ? (
                <>
                  <div className={`w-3 h-3 rounded-full ${
                    activeAccount.isLoggedIn ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-600">
                    @{activeAccount.username} - {activeAccount.isLoggedIn ? 'Conectado' : 'Desconectado'}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm text-gray-600">Nenhuma conta selecionada</span>
                </>
              )}
            </div>
          </div>

          {/* Account Selector */}
          {state.accounts.length > 1 && (
            <div className="space-y-2">
              <Label>Conta Ativa</Label>
              <Select 
                value={activeAccount?.id || ''} 
                onValueChange={switchAccount}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {state.accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          account.isLoggedIn ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        @{account.username}
                        {account.isMonitoring && (
                          <Eye className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status */}
          {state.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          {/* No Account Selected */}
          {!activeAccount && (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium mb-2">Nenhuma conta selecionada</h4>
              <p className="text-gray-600 mb-4">
                Adicione uma conta do Instagram para começar
              </p>
              <Button onClick={() => setShowAccountManager(true)}>
                Gerenciar Contas
              </Button>
            </div>
          )}

          {/* Login Form for existing account */}
          {activeAccount && !activeAccount.isLoggedIn && activeAccount.authType === 'credentials' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-600">
                  Reconectar conta @{activeAccount.username}
                </p>
              </div>
              <div>
                <Label htmlFor="username">Usuário do Instagram</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username || activeAccount.username}
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
                disabled={isSubmitting || state.isLoading || !credentials.password}
              >
                {isSubmitting || state.isLoading ? 'Conectando...' : 'Reconectar'}
              </Button>
            </form>
          )}

          {/* Controls */}
          {activeAccount && activeAccount.isLoggedIn && (
            <div className="space-y-4">
              {/* Account Info */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">@{activeAccount.username}</p>
                    <p className="text-sm text-green-600">
                      Autenticação: {activeAccount.authType === 'credentials' ? 'Credenciais' : 'Cookie'}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    Conectado
                  </Badge>
                </div>
              </div>

              {/* Monitoring Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">Monitoramento de Mensagens</p>
                  <p className="text-sm text-gray-600">
                    {activeAccount.isMonitoring ? 'Ativo - Monitorando novas mensagens' : 'Inativo'}
                  </p>
                </div>
                <Button
                  onClick={handleToggleMonitoring}
                  disabled={isSubmitting || state.isLoading}
                  variant={activeAccount.isMonitoring ? 'destructive' : 'default'}
                >
                  {activeAccount.isMonitoring ? (
                    <><EyeOff className="w-4 h-4 mr-2" />Parar</>
                  ) : (
                    <><Eye className="w-4 h-4 mr-2" />Iniciar</>
                  )}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => refreshStatus(activeAccount.id)}
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
    </div>
  );
}