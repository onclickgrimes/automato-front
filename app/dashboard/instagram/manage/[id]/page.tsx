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
  XCircle,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
  Star,
  Workflow
} from 'lucide-react';
import { InstagramAccount } from '@/lib/types/instagram-accounts';
import { Workflow as WorkflowType } from '@/lib/types/workflow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { useSSELogs, LogEntry } from '@/lib/hooks/useSSELogs';

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
  
  // Estados para edição de conta
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCookie, setShowCookie] = useState(false);
  const [editedAccount, setEditedAccount] = useState<Partial<InstagramAccount>>({});
  
  // Estados para workflows favoritos
  const [favoriteWorkflows, setFavoriteWorkflows] = useState<WorkflowType[]>([]);
  const [workflowStatuses, setWorkflowStatuses] = useState<Record<string, 'running' | 'stopped'>>({});
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  
  // SSE Logs
  const { logs, isConnected: isSSEConnected, error: sseError, clearLogs } = useSSELogs(
    currentAccount?.username || '',
    !!currentAccount?.username
  );

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
    
    const loadWorkflows = async () => {
      try {
        await loadFavoriteWorkflows();
      } catch (err) {
        console.error('Erro ao carregar workflows favoritos:', err);
      }
    };
    
    loadWorkflows();
  }, [accountId]);

  // Auto-scroll dos logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);



  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
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
          setEditedAccount(current);
          
          // Verificar status inicial
          await checkInstanceStatus(current.username);
        } else {
          throw new Error('Conta não encontrada');
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      console.error('Erro ao carregar dados:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavoriteWorkflows = async () => {
    try {
      setIsLoadingWorkflows(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('favorite', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const workflows = data?.map(record => record.workflow as WorkflowType) || [];
      setFavoriteWorkflows(workflows);
      return workflows.length;
    } catch (err) {
      console.error('Erro ao carregar workflows favoritos:', err);
      throw err;
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  const checkInstanceStatus = async (username: string) => {
    try {
      setIsCheckingStatus(true);
      
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
      
      return isActive;
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setInstanceStatus('unknown');
      } else {
        console.error(`Erro ao verificar status:`, err);
        setInstanceStatus('unknown');
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
      } else {
        throw new Error(result.message || 'Erro ao iniciar instância');
      }
    } catch (err) {
      console.error('Erro ao iniciar instância:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const stopInstance = async () => {
    if (!currentAccount) return;
    
    try {
      setIsStopping(true);
      
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
      } else {
        throw new Error(result.message || 'Erro ao parar instância');
      }
    } catch (err) {
      console.error('Erro ao parar instância:', err);
    } finally {
      setIsStopping(false);
    }
  };

  const checkActiveInstances = async () => {
    try {
      setIsCheckingActive(true);
      
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
      
      // Apenas processa os dados sem adicionar logs manuais
      // Os logs virão automaticamente via SSE do backend
    } catch (err) {
      console.error('Erro ao verificar instâncias ativas:', err);
    } finally {
      setIsCheckingActive(false);
    }
  };

  const handleAccountChange = (newAccountId: string) => {
    if (newAccountId !== accountId) {
      router.push(`/dashboard/instagram/manage/${newAccountId}`);
    }
  };

  const saveAccountChanges = async () => {
    if (!currentAccount || !editedAccount) return;
    
    try {
      const response = await fetch(`/api/instagram-accounts/${currentAccount.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedAccount)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar alterações');
      }
      
      const result = await response.json();
      if (result.success) {
        setCurrentAccount(result.data);
        setIsEditingAccount(false);
      } else {
        throw new Error(result.error || 'Erro ao salvar');
      }
    } catch (err) {
      console.error('Erro ao salvar conta:', err);
    }
  };

  const cancelAccountEdit = () => {
    setEditedAccount(currentAccount || {});
    setIsEditingAccount(false);
    setShowPassword(false);
    setShowCookie(false);
  };

  const startWorkflow = async (workflowId: string) => {
    try {
      setWorkflowStatuses(prev => ({ ...prev, [workflowId]: 'running' }));
      
      const response = await fetch(`/api/workflows/${workflowId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: params.id
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao iniciar workflow');
      }

      const result = await response.json();
      console.log('Workflow iniciado com sucesso:', result);
    } catch (err) {
      console.error('Erro ao iniciar workflow:', err);
      setWorkflowStatuses(prev => ({ ...prev, [workflowId]: 'stopped' }));
    }
  };

  const stopWorkflow = async (workflowId: string) => {
    try {
      setWorkflowStatuses(prev => ({ ...prev, [workflowId]: 'stopped' }));
      
      const response = await fetch(`/api/workflows/${workflowId}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: params.id
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao parar workflow');
      }

      const result = await response.json();
      console.log('Workflow parado com sucesso:', result);
    } catch (err) {
      console.error('Erro ao parar workflow:', err);
      setWorkflowStatuses(prev => ({ ...prev, [workflowId]: 'running' }));
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
              <CardTitle className="flex items-center justify-between">
                Informações da Conta
                <div className="flex items-center gap-2">
                  {isEditingAccount ? (
                    <>
                      <Button size="sm" onClick={saveAccountChanges}>
                        <Save className="w-4 h-4 mr-1" />
                        Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelAccountEdit}>
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditingAccount(true)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentAccount && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Username:</span>
                    <span className="font-medium">@{currentAccount.username}</span>
                  </div>
                  
                  {/* Toggle de Tipo de Autenticação */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Tipo de Autenticação:</Label>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm ${editedAccount.auth_type === 'credentials' ? 'font-medium' : 'text-gray-500'}`}>
                        Credenciais
                      </span>
                      <Switch
                        checked={editedAccount.auth_type === 'cookie'}
                        onCheckedChange={(checked) => {
                          if (isEditingAccount) {
                            setEditedAccount(prev => ({
                              ...prev,
                              auth_type: checked ? 'cookie' : 'credentials'
                            }));
                          }
                        }}
                        disabled={!isEditingAccount}
                      />
                      <span className={`text-sm ${editedAccount.auth_type === 'cookie' ? 'font-medium' : 'text-gray-500'}`}>
                        Cookie
                      </span>
                    </div>
                  </div>

                  {/* Campo de Senha (apenas para credentials) */}
                  {editedAccount.auth_type === 'credentials' && (
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Senha:</Label>
                      {isEditingAccount ? (
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={editedAccount.password || ''}
                            onChange={(e) => setEditedAccount(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Digite a senha"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">••••••••</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Campo de Cookie (apenas para cookie) */}
                  {editedAccount.auth_type === 'cookie' && (
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Cookie:</Label>
                      {isEditingAccount ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editedAccount.cookie || ''}
                            onChange={(e) => setEditedAccount(prev => ({ ...prev, cookie: e.target.value }))}
                            placeholder="Cole o cookie aqui"
                            className="min-h-[100px] font-mono text-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCookie(!showCookie)}
                          >
                            {showCookie ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                            {showCookie ? 'Ocultar' : 'Mostrar'} Cookie
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 font-mono">
                            {showCookie ? (currentAccount.cookie || 'Não definido') : '••••••••••••••••'}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCookie(!showCookie)}
                          >
                            {showCookie ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5" />
                <span>Logs em Tempo Real</span>
                <Badge variant="outline">{logs.length}</Badge>
                <Badge variant={isSSEConnected ? 'default' : 'destructive'} className="text-xs">
                  {isSSEConnected ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={clearLogs}
                className="text-xs"
              >
                Limpar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sseError && (
                <Alert>
                  <AlertDescription className="text-sm">
                    Erro na conexão SSE: {sseError}
                  </AlertDescription>
                </Alert>
              )}
              <div className="bg-gray-900 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    Nenhum log ainda. As ações aparecerão aqui em tempo real via SSE...
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
            </div>
          </CardContent>
        </Card>

        {/* Workflows Favoritos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Workflows Favoritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingWorkflows ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Carregando workflows...</span>
              </div>
            ) : favoriteWorkflows.length === 0 ? (
              <div className="text-center py-8">
                <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Nenhum workflow favorito encontrado</p>
                <p className="text-gray-400 text-xs mt-1">Marque workflows como favoritos para acesso rápido</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteWorkflows.map((workflow, index) => {
                  const workflowId = workflow?.id || `workflow-${index}`;
                  const status = workflowStatuses[workflowId] || 'stopped';
                  const isRunning = status === 'running';
                  
                  return (
                    <div key={workflowId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Workflow className="w-4 h-4 text-blue-600" />
                          <h4 className="font-medium text-sm">{workflow.name}</h4>
                          <Badge variant={isRunning ? 'default' : 'secondary'} className="text-xs">
                            {isRunning ? 'Executando' : 'Parado'}
                          </Badge>
                        </div>
                        {workflow.description && (
                          <p className="text-xs text-gray-600 mt-1 ml-6">{workflow.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isRunning ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => stopWorkflow(workflowId)}
                            className="text-xs"
                          >
                            Parar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => startWorkflow(workflowId)}
                            className="text-xs"
                          >
                            Iniciar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}