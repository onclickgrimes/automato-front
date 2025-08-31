'use client';

import React, { useState } from 'react';
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
  LogOut
} from 'lucide-react';
// Instagram hooks removidos - componente em modo mock
// Tipos locais para substituir os tipos removidos
type InstagramAuthType = 'username_password' | 'session_cookie' | 'auth_token';
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

const initialFormData: AddAccountFormData = {
  username: '',
  password: '',
  cookies: '',
  authType: 'username_password'
};

export function InstagramAccountManager() {
  // Hooks removidos - dados mockados
  const state = { accounts: [], activeAccountId: null };
  const addAccount = async () => {};
  const removeAccount = async () => {};
  const login = async () => {};
  const logout = async () => {};
  const switchAccount = async () => {};
  const getActiveAccount = () => null;
  const refreshStatus = async () => {};
  
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
      const loginRequest = {
        username: formData.username,
        authType: formData.authType,
        accountId: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...(formData.authType === 'credentials' 
          ? { password: formData.password }
          : { cookies: formData.cookies })
      };

      const result = await addAccount(loginRequest as any);
      
      if (result.success) {
        setFormData(initialFormData);
        setIsAddDialogOpen(false);
      } else {
        setFormError(result.error || result.message || 'Erro ao adicionar conta');
      }
    } catch (error) {
      setFormError('Erro inesperado ao adicionar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    if (confirm('Tem certeza que deseja remover esta conta?')) {
      await removeAccount(accountId);
    }
  };

  const handleLoginAccount = async (accountId: string) => {
    const account = state.accounts.find(acc => acc.id === accountId);
    if (!account) return;

    // Para reconectar, precisaríamos das credenciais originais
    // Por enquanto, apenas tentamos fazer login novamente
    await refreshStatus(accountId);
  };

  const handleLogoutAccount = async (accountId: string) => {
    await logout(accountId);
  };

  const getAccountStatusBadge = (account: typeof state.accounts[0]) => {
    if (account.isLoggedIn) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Gerenciar Contas Instagram
          </CardTitle>
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
      </CardHeader>
      
      <CardContent>
        {state.accounts.length === 0 ? (
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
                      {getAuthTypeBadge(activeAccount.authType)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Lista de Contas */}
            <div className="space-y-3">
              <h4 className="font-medium">Todas as Contas ({state.accounts.length})</h4>
              {state.accounts.map((account) => (
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
                      <div>
                        <p className="font-medium">@{account.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getAccountStatusBadge(account)}
                          {getAuthTypeBadge(account.authType)}
                          {account.isMonitoring && (
                            <Badge variant="secondary">
                              <Eye className="w-3 h-3 mr-1" />
                              Monitorando
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {account.id !== activeAccount?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => switchAccount(account.id)}
                        >
                          Ativar
                        </Button>
                      )}
                      
                      {account.isLoggedIn ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLogoutAccount(account.id)}
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoginAccount(account.id)}
                        >
                          <LogIn className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => refreshStatus(account.id)}
                      >
                        <RefreshCw className="w-4 h-4" />
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
                  
                  {account.lastActivity && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Última atividade: {new Date(account.lastActivity).toISOString().replace('T', ' ').substring(0, 19)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {state.isLoading && (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        )}
        
        {state.error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}