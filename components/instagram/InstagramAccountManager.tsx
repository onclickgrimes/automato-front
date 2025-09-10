'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  User, 
  Key, 
  Cookie, 
  CheckCircle, 
  XCircle, 
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  LogIn,
  LogOut,
  Play,
  Pause,
  Search,
  Filter,
  Star
} from 'lucide-react';
import { AccountManagementModal } from './AccountManagementModal';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';

// Tipos locais simplificados
type InstagramAuthType = 'credentials' | 'cookie';

interface InstagramAccount {
  id: string;
  username: string;
  auth_type: InstagramAuthType;
  is_logged_in: boolean;
  is_monitoring: boolean;
  password?: string | null;
  cookie?: string | null;
  created_at: string;
  last_activity?: string;
}

type InstagramLoginRequest = {
  username: string;
  password?: string;
  sessionCookie?: string;
  authToken?: string;
  authType: InstagramAuthType;
};

interface AddAccountFormData {
  username: string;
  password: string;
  cookies: string;
  authType: InstagramAuthType;
}

interface WorkflowRecord {
  id: string;
  user_id: string;
  workflow: {
    id: string;
    name: string;
    description?: string;
    instanceName: string;
    steps: any[];
  };
  created_at: string;
  updated_at: string;
}

const initialFormData: AddAccountFormData = {
  username: '',
  password: '',
  cookies: '',
  authType: 'credentials'
};

export function InstagramAccountManager() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [managingAccount, setManagingAccount] = useState<InstagramAccount | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [favoriteWorkflows, setFavoriteWorkflows] = useState<Record<string, WorkflowRecord[]>>({});
  // Estados locais
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  
  // Estados para busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'creation' | 'alphabetical'>('creation');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  
  // Estado para controlar loading de contas específicas
  const [workingAccountId, setWorkingAccountId] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  // Estado para armazenar status das contas (verificado via API)
  const [accountsStatus, setAccountsStatus] = useState<Record<string, boolean>>({});

  // Funções para chamadas diretas às APIs
  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/instagram-accounts');
      if (!response.ok) {
        throw new Error('Erro ao carregar contas');
      }
      const result = await response.json();
      if (result.success) {
        const accountsData = result.data || [];
        // Ordenar por data de criação (mais recentes primeiro)
        const sortedAccounts = accountsData.sort((a: InstagramAccount, b: InstagramAccount) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAccounts(sortedAccounts);
        setError(null);
      } else {
        throw new Error(result.error || 'Erro ao carregar contas');
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Backend host está offline. Verifique a conexão.');
      } else {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao carregar contas:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (accountData: any) => {
    try {
      const response = await fetch('/api/instagram-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar conta');
      }
      
      await loadAccounts(); // Recarregar lista
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        // Host offline - não logar no console
        throw new Error('Backend host está offline. Verifique a conexão.');
      } else {
        console.error('Erro ao criar conta:', err);
        throw err;
      }
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/instagram-accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erro ao deletar conta');
      }
      await loadAccounts(); // Recarregar lista
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        // Host offline - não logar no console
        throw new Error('Backend host está offline. Verifique a conexão.');
      } else {
        console.error('Erro ao deletar conta:', err);
        throw err;
      }
    }
  };

  const updateAccount = async (accountId: string, data: Partial<InstagramAccount>) => {
    try {
      const response = await fetch(`/api/instagram-accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar conta');
      }
      await loadAccounts(); // Recarregar lista
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        // Host offline - não logar no console
        throw new Error('Backend host está offline. Verifique a conexão.');
      } else {
        console.error('Erro ao atualizar conta:', err);
        throw err;
      }
    }
  };

  const updateLoginStatus = async (accountId: string, isLoggedIn: boolean) => {
    try {
      const response = await fetch(`/api/instagram-accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_logged_in: isLoggedIn }),
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar status de login');
      }
      await loadAccounts(); // Recarregar lista
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        // Host offline - não logar no console
        throw new Error('Backend host está offline. Verifique a conexão.');
      } else {
        console.error('Erro ao atualizar status de login:', err);
        throw err;
      }
    }
  };

  // Função para filtrar e ordenar contas
  const filterAndSortAccounts = () => {
    let filtered = [...accounts];
    
    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(account => 
        account.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(account => {
        const isActive = accountsStatus[account.id] || false;
        if (statusFilter === 'active') return isActive;
        if (statusFilter === 'paused') return !isActive;
        return true;
      });
    }
    
    // Aplicar ordenação
    if (sortOrder === 'alphabetical') {
      filtered.sort((a, b) => a.username.localeCompare(b.username));
    } else {
      // Manter ordenação por data de criação (já aplicada no loadAccounts)
      filtered.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    
    setFilteredAccounts(filtered);
  };
  
  // Função para verificar status de todas as contas no backend
  const checkAllAccountsStatus = async () => {
    if (accounts.length === 0) return;
    
    setIsCheckingStatus(true);
    let hostOfflineDetected = false;
    
    try {
      const statusPromises = accounts.map(async (account) => {
        try {
          const response = await fetch(`https://able-viable-elephant.ngrok-free.app/api/instagram/status/${account.username}`, {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          });

          if (!response.ok) {
            return { accountId: account.id, isActive: false };
          }

          const result = await response.json();
          return {
            accountId: account.id,
            isActive: result.success === true && result.status === 'active'
          };
        } catch (error) {
          if (error instanceof TypeError && error.message.includes('fetch')) {
            hostOfflineDetected = true;
          } else {
            console.error(`Erro ao verificar status da conta AccountManager ${account.username}:`, error);
          }
          return { accountId: account.id, isActive: false };
        }
      });

      const statusResults = await Promise.all(statusPromises);
      
      // Atualizar o estado local com os status das contas
      const newAccountsStatus: Record<string, boolean> = {};
      statusResults.forEach(({ accountId, isActive }) => {
        newAccountsStatus[accountId] = isActive;
      });
      
      setAccountsStatus(newAccountsStatus);
      
      // Avisar se o host estiver offline
      if (hostOfflineDetected) {
        setError('Host do backend está offline. Não foi possível verificar o status das contas.');
      }
      
      // Recarregar contas para refletir as mudanças
       await loadAccounts();
     } catch (error) {
       if (error instanceof TypeError && error.message.includes('fetch')) {
         setError('Host do backend está offline. Não foi possível verificar o status das contas.');
       } else {
         console.error('Erro ao verificar status das contas:', error);
         setError('Erro ao verificar status das contas. Verifique sua conexão.');
       }
     } finally {
       setIsCheckingStatus(false);
     }
   };

  // Função para carregar workflows favoritos para uma conta específica
  const loadFavoriteWorkflows = async (accountUsername: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .eq('favorite', true)
        .eq('workflow->>instanceName', accountUsername)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Erro ao carregar workflows favoritos:', error);
        return;
      }

      setFavoriteWorkflows(prev => ({
        ...prev,
        [accountUsername]: data || []
      }));
    } catch (error) {
      console.error('Erro ao carregar workflows favoritos:', error);
    }
  };

  // Função para iniciar um workflow
  const startWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao iniciar workflow');
      }

      const result = await response.json();
      alert('Workflow iniciado com sucesso!');
    } catch (error) {
      console.error('Erro ao iniciar workflow:', error);
      alert(`Erro ao iniciar workflow: ${error.message}`);
    }
  };

  // Carregar contas ao montar o componente
  useEffect(() => {
    loadAccounts();
  }, []);
  
  // Verificar status das contas após carregá-las
  useEffect(() => {
    if (accounts.length > 0) {
      checkAllAccountsStatus();
    }
  }, [accounts.length]); // Executa quando o número de contas muda (após loadAccounts)
  
  // Aplicar filtros quando accounts, searchTerm, sortOrder ou statusFilter mudarem
  useEffect(() => {
    filterAndSortAccounts();
  }, [accounts, searchTerm, sortOrder, statusFilter]);

  // Carregar workflows favoritos para todas as contas
  useEffect(() => {
    if (user && accounts.length > 0) {
      accounts.forEach(account => {
        loadFavoriteWorkflows(account.username);
      });
    }
  }, [user, accounts]);
  
  const getActiveAccount = () => {
    if (!Array.isArray(accounts)) return null;
    return accounts.find(acc => acc.id === activeAccountId) || null;
  };
  
  const switchAccount = (accountId: string) => {
    setActiveAccountId(accountId);
  };
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AddAccountFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const activeAccount = getActiveAccount();

  const handleInputChange = (field: keyof AddAccountFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formError) setFormError(null);
  };

  const handleAuthTypeChange = (authType: InstagramAuthType) => {
    setFormData(prev => ({ ...prev, authType }));
    if (formError) setFormError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setFormError('Nome de usuário é obrigatório');
      return false;
    }

    if (formData.authType === 'credentials') {
      if (!formData.password.trim()) {
        setFormError('Senha é obrigatória para login com credenciais');
        return false;
      }
    } else if (formData.authType === 'cookie') {
      if (!formData.cookies.trim()) {
        setFormError('Cookies são obrigatórios para login com cookie');
        return false;
      }
      
      // Validação básica do formato de cookies
      try {
        const cookieLines = formData.cookies.split('\n').filter(line => line.trim());
        if (cookieLines.length === 0) {
          setFormError('Formato de cookies inválido');
          return false;
        }
      } catch (error) {
        setFormError('Formato de cookies inválido');
        return false;
      }
    }

    return true;
  };

  const handleAddAccount = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const accountData = {
        username: formData.username,
        auth_type: formData.authType,
        ...(formData.authType === 'credentials' ? { password: formData.password } : { cookie: formData.cookies })
      };

      await createAccount(accountData);
      setFormData(initialFormData);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar conta:', error);
      setFormError('Erro inesperado ao adicionar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    if (confirm('Tem certeza que deseja remover esta conta?')) {
      try {
        await deleteAccount(accountId);
        
        // Se a conta ativa foi removida, limpar o estado
        if (activeAccountId === accountId) {
          setActiveAccountId(null);
        }
      } catch (error) {
        console.error('Erro ao remover conta:', error);
        setError('Erro ao remover conta');
      }
    }
  };

  const handleManageAccount = (account: InstagramAccount) => {
    router.push(`/dashboard/instagram/manage/${account.id}`);
  };

  const handleAccountUpdate = async (accountId: string, data: Partial<InstagramAccount>) => {
    try {
      await updateAccount(accountId, data);
      // Recarregar a lista de contas após a atualização
      // A lista será atualizada automaticamente pelo hook useInstagramAccountsCRUD
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      throw error;
    }
  };

  const handleCloseManageModal = () => {
    setIsManageModalOpen(false);
    setManagingAccount(null);
  };

  const handleLoginAccount = async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    try {
      await updateLoginStatus(accountId, true);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError('Erro ao fazer login');
    }
  };

  const handleLogoutAccount = async (accountId: string) => {
    try {
      await updateLoginStatus(accountId, false);
      
      // Se a conta ativa foi deslogada, limpar o estado
      if (activeAccountId === accountId) {
        setActiveAccountId(null);
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const checkAccountStatus = async (username: string) => {
    try {
      const response = await fetch(`https://able-viable-elephant.ngrok-free.app/api/instagram/status/${username}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao verificar status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Host offline - não logar erro de conectividade
        return null;
      } else {
        console.error('Erro ao verificar status:', error);
        return null;
      }
    }
  };

  const handleToggleWorking = async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    // Prevenir múltiplas operações simultâneas
    if (workingAccountId) return;

    setWorkingAccountId(accountId);

    try {
      setError(null);
      
      // Verificar status atual no backend antes de iniciar/pausar
      const statusResult = await checkAccountStatus(account.username);
      
      // Verificar status atual da conta
      const currentStatus = accountsStatus[accountId] || false;
      
      // Se está tentando iniciar (status = false -> true)
      if (!currentStatus) {
        // Verificar se já está ativo no backend
        if (statusResult && statusResult.isActive) {
          // Se já está ativo no backend, apenas atualizar o estado local
          setAccountsStatus(prev => ({ ...prev, [accountId]: true }));
          setWorkingAccountId(null);
          return;
        }
        
        // Fazer requisição para o backend do ngrok para iniciar o puppeteer
        const response = await fetch('https://able-viable-elephant.ngrok-free.app/api/instagram/iniciar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            accountId: accountId,
            username: account.username,
            auth_type: account.auth_type,
            password: account.password,
            cookie: account.cookie
          })
        });

        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 'ok' || result.success) {
          // Se o backend retornou ok, atualizar o estado local
          setAccountsStatus(prev => ({ ...prev, [accountId]: true }));
        } else {
          throw new Error(result.message || 'Erro ao iniciar conta no backend');
        }
      } else {
        // Se está pausando (status = true -> false)
        // Verificar se realmente está ativo no backend
        if (statusResult && !statusResult.isActive) {
          // Se já está inativo no backend, apenas atualizar o estado local
          setAccountsStatus(prev => ({ ...prev, [accountId]: false }));
          setWorkingAccountId(null);
          return;
        }
        
        // Fazer requisição para pausar no backend
        const response = await fetch(`https://able-viable-elephant.ngrok-free.app/api/instagram/parar/${account.username}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (!response.ok) {
          throw new Error(`Erro ao pausar no backend: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 'ok' || result.success) {
          // Se o backend retornou ok, atualizar o estado local
          setAccountsStatus(prev => ({ ...prev, [accountId]: false }));
        } else {
          throw new Error(result.message || 'Erro ao pausar conta no backend');
        }
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Host do backend está offline. Não foi possível alterar o status da conta.');
      } else {
        console.error('Erro ao alterar status da conta:', error);
        setError(`Erro ao alterar status da conta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
    
    setWorkingAccountId(null);
  };

  const getAccountStatusBadge = (account: any) => {
    const isActive = accountsStatus[account.id] || false;
    if (isActive) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Conectado
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Desconectado
        </Badge>
      );
    }
  };

  const getAuthTypeBadge = (authType: InstagramAuthType) => {
    return authType === 'credentials' ? (
      <Badge variant="outline">
        <Key className="w-3 h-3 mr-1" />
        Credenciais
      </Badge>
    ) : (
      <Badge variant="outline">
        <Cookie className="w-3 h-3 mr-1" />
        Cookie
      </Badge>
    );
  };

  const refreshStatus = async (accountId: string) => {
    try {
      await loadAccounts();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setError('Erro ao atualizar status da conta');
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Gerenciar Contas Instagram
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={checkAllAccountsStatus}
              disabled={isCheckingStatus || accounts.length === 0}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isCheckingStatus ? 'animate-spin' : ''}`} />
              {isCheckingStatus ? 'Verificando...' : 'Atualizar Status'}
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Conta</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    placeholder="@seu_usuario"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Método de Autenticação</Label>
                  <Select 
                    value={formData.authType} 
                    onValueChange={handleAuthTypeChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credentials">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Login e Senha
                        </div>
                      </SelectItem>
                      <SelectItem value="cookie">
                        <div className="flex items-center gap-2">
                          <Cookie className="w-4 h-4" />
                          Cookies
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Tabs value={formData.authType} className="w-full">
                  <TabsContent value="credentials" className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Sua senha"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="cookie" className="space-y-2">
                    <Label htmlFor="cookies">Cookies</Label>
                    <Textarea
                      id="cookies"
                      placeholder="Cole aqui os cookies do Instagram...\nFormato: nome=valor; nome2=valor2"
                      value={formData.cookies}
                      onChange={(e) => handleInputChange('cookies', e.target.value)}
                      disabled={isSubmitting}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole os cookies obtidos do navegador após fazer login no Instagram
                    </p>
                  </TabsContent>
                </Tabs>

                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleAddAccount} 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {isSubmitting ? 'Adicionando...' : 'Adicionar Conta'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
        
        {/* Controles de busca e filtro */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome de usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={sortOrder} onValueChange={(value: 'creation' | 'alphabetical') => setSortOrder(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creation">Data de criação</SelectItem>
                <SelectItem value="alphabetical">Ordem alfabética</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'paused') => setStatusFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="paused">Pausados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {(!Array.isArray(accounts) || accounts.length === 0) ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma conta conectada</h3>
            <p className="text-muted-foreground mb-4">
              Adicione uma conta do Instagram para começar a usar a automação
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Conta
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Conta Ativa */}
            {activeAccount && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Conta Ativa</h4>
                  <Badge variant="default">Ativa</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                    {activeAccount.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">@{activeAccount.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getAccountStatusBadge(activeAccount)}
                      {getAuthTypeBadge(activeAccount.auth_type)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Lista de Contas */}
            <div className="space-y-3">
              <h4 className="font-medium">Todas as Contas ({Array.isArray(filteredAccounts) ? filteredAccounts.length : 0})</h4>
                {Array.isArray(filteredAccounts) && filteredAccounts.map((account) => (
                <div 
                  key={account.id} 
                  className={`p-3 border rounded-lg transition-colors ${
                    account.id === activeAccount?.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {account.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">@{account.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getAccountStatusBadge(account)}
                          {getAuthTypeBadge(account.auth_type)}
                          {account.is_monitoring && (
                            <Badge variant="secondary">
                              <Eye className="w-3 h-3 mr-1" />
                              Monitorando
                            </Badge>
                          )}
                        </div>
                        
                        {/* Workflows Favoritos */}
                        {favoriteWorkflows[account.username] && favoriteWorkflows[account.username].length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {favoriteWorkflows[account.username].slice(0, 3).map((workflowRecord) => (
                              <Button
                                key={workflowRecord.id}
                                size="sm"
                                variant="outline"
                                onClick={() => startWorkflow(workflowRecord.id)}
                                className="h-7 px-2 text-xs flex items-center gap-1"
                                title={`Executar: ${workflowRecord.workflow.name}`}
                              >
                                <Play className="w-3 h-3" />
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                {workflowRecord.workflow.name.length > 10 
                                  ? `${workflowRecord.workflow.name.substring(0, 10)}...` 
                                  : workflowRecord.workflow.name
                                }
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleManageAccount(account)}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Gerenciar
                      </Button>
                      
                      <Button
                        size="sm"
                        variant={(accountsStatus[account.id] || false) ? "secondary" : "outline"}
                        onClick={() => handleToggleWorking(account.id)}
                        disabled={workingAccountId === account.id}
                      >
                        {workingAccountId === account.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            {(accountsStatus[account.id] || false) ? 'Pausando...' : 'Iniciando...'}
                          </>
                        ) : (accountsStatus[account.id] || false) ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Iniciar
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveAccount(account.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {account.last_activity && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Última atividade: {new Date(account.last_activity).toISOString().replace('T', ' ').substring(0, 19)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {loading && (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
    
    {/* Modal de Gerenciamento de Conta */}
    {managingAccount && (
      <AccountManagementModal
        account={managingAccount}
        isOpen={isManageModalOpen}
        onClose={handleCloseManageModal}
        onAccountUpdate={handleAccountUpdate}
      />
    )}
  </>
  );
}