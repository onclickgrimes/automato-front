'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Square,
  RefreshCw,
  Activity,
  Users,
  ChevronDown,
  Terminal,
  ArrowLeft,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { InstagramAccount } from '@/lib/types/instagram-accounts';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const BACKEND_BASE_URL = 'https://able-viable-elephant.ngrok-free.app';

export default function InstagramControlPanel() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Estados principais
  const [currentAccount, setCurrentAccount] = useState<InstagramAccount | null>(null);
  const [allAccounts, setAllAccounts] = useState<InstagramAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de controle
  const [instanceStatus, setInstanceStatus] = useState<'active' | 'inactive' | 'unknown'>('unknown');
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isCheckingActive, setIsCheckingActive] = useState(false);
  
  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, [accountId]);

  // Auto-scroll dos logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (level: LogEntry['level'], message: string) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [...prev, newLog]);
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      addLog('info', 'Carregando dados iniciais...');
      
      // Carregar todas as contas
      const accountsResponse = await fetch('/api/instagram-accounts');
      if (!accountsResponse.ok) {
        throw new Error('Erro ao carregar contas');
      }
      
      const accountsResult = await accountsResponse.json();
      if (accountsResult.success) {
        setAllAccounts(accountsResult.data || []);
        
        // Encontrar conta atual
        const current = accountsResult.data.find((acc: InstagramAccount) => acc.id === accountId);
        if (current) {
          setCurrentAccount(current);
          addLog('success', `Conta @${current.username} carregada com sucesso`);
          
          // Verificar status inicial
          await checkInstanceStatus(current.username);
        } else {
          throw new Error('Conta não encontrada');
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      addLog('error', `Erro ao carregar dados: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkInstanceStatus = async (username: string) => {
    try {
      setIsCheckingStatus(true);
      addLog('info', `Verificando status da instância @${username}...`);
      
      const response = await fetch(`${BACKEND_BASE_URL}/api/instagram/status/${username}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const result = await response.json();
      const isActive = result.success === true && result.status === 'active';
      
      setInstanceStatus(isActive ? 'active' : 'inactive');
      addLog(isActive ? 'success' : 'warning', 
        `Status: ${isActive ? 'Instância ativa' : 'Instância inativa'}`);
      
      return isActive;
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setInstanceStatus('unknown');
        addLog('error', 'Backend offline - não foi possível verificar status');
      } else {
        console.error(`Erro ao verificar status:`, err);
        setInstanceStatus('unknown');
        addLog('error', `Erro ao verificar status: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
      return false;
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const startInstance = async () => {
    if (!currentAccount) return;
    
    try {
      setIsStarting(true);
      addLog('info', `Iniciando instância @${currentAccount.username}...`);
      
      const body = {
        accountId: currentAccount.id,
        username: currentAccount.username,
        auth_type: currentAccount.auth_type,
        ...(currentAccount.auth_type === 'credentials' 
          ? { password: currentAccount.password } 
          : { cookies: currentAccount.cookie })
      };
      
      const response = await fetch(`${BACKEND_BASE_URL}/api/instagram/iniciar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'ok' || result.success) {
        setInstanceStatus('active');
        addLog('success', 'Instância iniciada com sucesso!');
      } else {
        throw new Error(result.message || 'Erro ao iniciar instância');
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        addLog('error', 'Backend offline - não foi possível iniciar instância');
      } else {
        console.error('Erro ao iniciar instância:', err);
        addLog('error', `Erro ao iniciar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
    } finally {
      setIsStarting(false);
    }
  };

  const stopInstance = async () => {
    if (!currentAccount) return;
    
    try {
      setIsStopping(true);
      addLog('info', `Parando instância @${currentAccount.username}...`);
      
      const response = await fetch(`${BACKEND_BASE_URL}/api/instagram/parar/${currentAccount.username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'ok' || result.success) {
        setInstanceStatus('inactive');
        addLog('success', 'Instância parada com sucesso!');
      } else {
        throw new Error(result.message || 'Erro ao parar instância');
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        addLog('error', 'Backend offline - não foi possível parar instância');
      } else {
        console.error('Erro ao parar instância:', err);
        addLog('error', `Erro ao parar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
    } finally {
      setIsStopping(false);
    }
  };

  const checkActiveInstances = async () => {
    try {
      setIsCheckingActive(true);
      addLog('info', 'Verificando instâncias ativas...');
      
      const response = await fetch(`${BACKEND_BASE_URL}/api/instagram/ativos`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        const activeCount = result.data.length;
        const activeUsernames = result.data.map((item: any) => item.username || item).join(', ');
        
        addLog('success', `${activeCount} instância(s) ativa(s): ${activeUsernames || 'Nenhuma'}`);
      } else {
        addLog('warning', 'Nenhuma instância ativa encontrada');
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        addLog('error', 'Backend offline - não foi possível verificar instâncias ativas');
      } else {
        console.error('Erro ao verificar instâncias ativas:', err);
        addLog('error', `Erro ao verificar ativos: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
    } finally {
      setIsCheckingActive(false);
    }
  };

  const handleAccountChange = (newAccountId: string) => {
    if (newAccountId !== accountId) {
      router.push(`/dashboard/instagram/manage/${newAccountId}`);
    }
  };

  const getStatusColor = () => {
    switch (instanceStatus) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (instanceStatus) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />;
    }
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Carregando painel de controle...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/dashboard/instagram')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/dashboard/instagram')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            {/* Dropdown de Contas */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Conta:</span>
              <Select value={accountId} onValueChange={handleAccountChange}>
                <SelectTrigger className="w-64">
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      <span>@{currentAccount?.username}</span>
                      <Badge variant={instanceStatus === 'active' ? 'default' : 'secondary'}>
                        {instanceStatus === 'active' ? 'Ativo' : instanceStatus === 'inactive' ? 'Inativo' : 'Desconhecido'}
                      </Badge>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>@{account.username}</span>
                        <Badge 
                          variant={account.auth_type === 'credentials' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {account.auth_type === 'credentials' ? 'Cred' : 'Cookie'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {instanceStatus === 'active' ? 'Instância Ativa' : 
               instanceStatus === 'inactive' ? 'Instância Inativa' : 'Status Desconhecido'}
            </span>
          </div>
        </div>
      </div>

      {/* Painel Central */}
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Controle da Instância */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Controle da Instância</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={startInstance}
                  disabled={isStarting || instanceStatus === 'active'}
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                >
                  {isStarting ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                  <span className="text-sm">Iniciar</span>
                </Button>
                
                <Button 
                  onClick={stopInstance}
                  disabled={isStopping || instanceStatus === 'inactive'}
                  variant="destructive"
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                >
                  {isStopping ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Square className="w-6 h-6" />
                  )}
                  <span className="text-sm">Parar</span>
                </Button>
                
                <Button 
                  onClick={() => currentAccount && checkInstanceStatus(currentAccount.username)}
                  disabled={isCheckingStatus}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                >
                  {isCheckingStatus ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Activity className="w-6 h-6" />
                  )}
                  <span className="text-sm">Verificar Status</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/dashboard/instagram/flows')}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                >
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Workflows</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Conta */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              {currentAccount && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Username:</span>
                    <span className="font-medium">@{currentAccount.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tipo de Auth:</span>
                    <Badge variant={currentAccount.auth_type === 'credentials' ? 'default' : 'secondary'}>
                      {currentAccount.auth_type === 'credentials' ? 'Credenciais' : 'Cookie'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status Login:</span>
                    <Badge variant={currentAccount.is_logged_in ? 'default' : 'destructive'}>
                      {currentAccount.is_logged_in ? 'Logado' : 'Deslogado'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monitoramento:</span>
                    <Badge variant={currentAccount.is_monitoring ? 'default' : 'secondary'}>
                      {currentAccount.is_monitoring ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Criado em:</span>
                    <span className="text-sm">
                      {new Date(currentAccount.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Logs em Tempo Real */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <span>Logs em Tempo Real</span>
              <Badge variant="outline">{logs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Nenhum log ainda. As ações aparecerão aqui...
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-2">
                      <span className="text-gray-500 text-xs min-w-[80px]">
                        [{log.timestamp}]
                      </span>
                      <span className={`text-xs uppercase min-w-[60px] ${getLogColor(log.level)}`}>
                        {log.level}
                      </span>
                      <span className="text-gray-300 flex-1">
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}