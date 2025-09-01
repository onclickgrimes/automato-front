'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Zap,
  Play,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Target,
  MessageCircle,
  Heart,
  UserPlus,
  Camera,
  Cookie,
  ArrowLeft
} from 'lucide-react';
import { InstagramAccount } from '@/lib/types/instagram-accounts';

interface RoutineData {
  id: string;
  name: string;
  description: string;
  trigger_type: 'manual' | 'schedule' | 'event';
  actions: any[];
  is_active: boolean;
  status: string;
  last_executed?: string;
  next_execution?: string;
}

interface QuickAction {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'upload' | 'message';
  name: string;
  description: string;
  icon: any;
}

const quickActions: QuickAction[] = [
  {
    id: 'like',
    type: 'like',
    name: 'Curtir Posts',
    description: 'Curtir posts específicos ou por hashtag',
    icon: Heart
  },
  {
    id: 'comment',
    type: 'comment',
    name: 'Comentar',
    description: 'Adicionar comentários em posts',
    icon: MessageCircle
  },
  {
    id: 'follow',
    type: 'follow',
    name: 'Seguir Usuários',
    description: 'Seguir usuários específicos ou por critério',
    icon: UserPlus
  },
  {
    id: 'upload',
    type: 'upload',
    name: 'Upload de Foto',
    description: 'Fazer upload de fotos com legenda',
    icon: Camera
  }
];

export default function ManageAccountPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  

  
  const [account, setAccount] = useState<InstagramAccount | null>(null);
  const [routines, setRoutines] = useState<RoutineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [accountStatus, setAccountStatus] = useState<boolean>(false);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    cookies: '',
    auth_type: 'credentials' as 'credentials' | 'cookie',
    monitor_keywords: [] as string[],
    auto_reply_enabled: false,
    auto_reply_message: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    loadAccount();
  }, [accountId]);

  // Função para verificar status da conta via API
  const checkAccountStatus = async (username: string) => {
    try {
      const response = await fetch(`https://able-viable-elephant.ngrok-free.app/api/instagram/status/${username}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.success === true && result.status === 'active';
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Host do backend está offline. Não foi possível verificar o status da conta.');
      } else {
        console.error(`Erro ao verificar status da conta ${username}:`, error);
      }
      return false;
    }
  };

  const loadAccount = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/instagram-accounts/${accountId}`);
      
      if (!response.ok) {
        throw new Error('Conta não encontrada');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const accountData = result.data;
        setAccount(accountData);
        setFormData({
          username: accountData.username || '',
          password: accountData.password || '',
          cookies: accountData.cookie || '',
          auth_type: accountData.auth_type || 'credentials',
          monitor_keywords: accountData.monitor_keywords || [],
          auto_reply_enabled: accountData.auto_reply_enabled || false,
          auto_reply_message: accountData.auto_reply_message || ''
        });
        
        // Verificar status da conta via API
        const status = await checkAccountStatus(accountData.username);
        setAccountStatus(status);
      } else {
        router.push('/dashboard/instagram');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Backend host está offline. Não foi possível carregar a conta.');
      } else {
        console.error('Erro ao carregar conta:', error);
      }
      router.push('/dashboard/instagram');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!account) return;
    
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      
      const updateData: Partial<InstagramAccount> = {
        username: formData.username,
        auth_type: formData.auth_type,
        monitor_keywords: formData.monitor_keywords,
        auto_reply_enabled: formData.auto_reply_enabled,
        auto_reply_message: formData.auto_reply_message
      };
      
      // Incluir password apenas se foi alterado
      if (formData.password && formData.password !== account.password) {
        updateData.password = formData.password;
      }
      
      // Incluir cookies apenas se foi alterado
      if (formData.cookies && formData.cookies !== (account.cookie || '')) {
        updateData.cookie = formData.cookies;
      }
      
      const response = await fetch(`/api/instagram-accounts/${account.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar conta');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar conta');
      }
      setSaveSuccess(true);
      
      // Recarregar dados da conta
      await loadAccount();
      
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setSaveError('Backend host está offline. Não foi possível salvar as alterações.');
      } else {
        console.error('Erro ao salvar:', error);
        setSaveError('Erro ao salvar alterações');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.monitor_keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        monitor_keywords: [...prev.monitor_keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      monitor_keywords: prev.monitor_keywords.filter(k => k !== keyword)
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Conta não encontrada</h1>
          <Button onClick={() => router.push('/dashboard/instagram')}>
            Voltar para Instagram
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/dashboard/instagram')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Conta</h1>
            <p className="text-muted-foreground">@{account.username}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={accountStatus ? "default" : "destructive"}>
              {accountStatus ? 'Ativo' : 'Inativo'}
            </Badge>
          <Badge variant={account.is_logged_in ? "default" : "secondary"}>
            {account.is_logged_in ? 'Logado' : 'Deslogado'}
          </Badge>
        </div>
      </div>

      {/* Alerts */}
      {saveError && (
        <Alert className="mb-4" variant="destructive">
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}
      
      {saveSuccess && (
        <Alert className="mb-4">
          <AlertDescription>Alterações salvas com sucesso!</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Target className="w-4 h-4 mr-2" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="actions">
            <Zap className="w-4 h-4 mr-2" />
            Ações Rápidas
          </TabsTrigger>
        </TabsList>

        {/* Configurações */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="@username"
                />
              </div>

              {/* Auth Type */}
              <div className="space-y-2">
                <Label htmlFor="auth_type">Tipo de Autenticação</Label>
                <Select
                  value={formData.auth_type}
                  onValueChange={(value: 'credentials' | 'cookie') => 
                    setFormData(prev => ({ ...prev, auth_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de autenticação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credentials">Credenciais (Usuário e Senha)</SelectItem>
                    <SelectItem value="cookie">Cookie de Sessão</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.auth_type === 'credentials' 
                    ? 'Usar nome de usuário e senha para fazer login'
                    : 'Usar cookies de sessão para autenticação'
                  }
                </p>
              </div>

              {/* Password - Only show for credentials auth */}
              {formData.auth_type === 'credentials' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Digite a senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Cookies - Only show for cookie auth */}
              {formData.auth_type === 'cookie' && (
                <div className="space-y-2">
                  <Label htmlFor="cookies">Cookies de Sessão</Label>
                  <div className="relative">
                    <Textarea
                      id="cookies"
                      value={formData.cookies}
                      onChange={(e) => setFormData(prev => ({ ...prev, cookies: e.target.value }))}
                      placeholder="Cole os cookies de sessão aqui..."
                      className="min-h-[100px]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => setShowCookies(!showCookies)}
                    >
                      {showCookies ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Os cookies serão salvos de forma segura no banco de dados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoramento */}
        <TabsContent value="monitoring">
          <div className="space-y-6">
            {/* Auto Reply */}
            <Card>
              <CardHeader>
                <CardTitle>Resposta Automática</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_reply"
                    checked={formData.auto_reply_enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, auto_reply_enabled: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="auto_reply">Ativar resposta automática</Label>
                </div>
                
                {formData.auto_reply_enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="auto_reply_message">Mensagem de resposta</Label>
                    <Textarea
                      id="auto_reply_message"
                      value={formData.auto_reply_message}
                      onChange={(e) => setFormData(prev => ({ ...prev, auto_reply_message: e.target.value }))}
                      placeholder="Digite a mensagem de resposta automática..."
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Palavras-chave para Monitoramento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Adicionar palavra-chave"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <Button onClick={handleAddKeyword}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.monitor_keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{keyword}</span>
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-1 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ações Rápidas */}
        <TabsContent value="actions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Card key={action.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{action.name}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <Button size="sm">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}