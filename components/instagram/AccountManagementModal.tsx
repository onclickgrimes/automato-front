'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Cookie
} from 'lucide-react';
import { InstagramAccount } from '@/lib/types/instagram-accounts';

interface AccountManagementModalProps {
  account: InstagramAccount;
  isOpen: boolean;
  onClose: () => void;
  onAccountUpdate: (accountId: string, data: Partial<InstagramAccount>) => Promise<void>;
}

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

export function AccountManagementModal({
  account,
  isOpen,
  onClose,
  onAccountUpdate
}: AccountManagementModalProps) {
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para edição da conta
  const [accountData, setAccountData] = useState({
    username: account.username,
    auth_type: account.auth_type || 'credentials',
    auto_reply_enabled: account.auto_reply_enabled,
    auto_reply_message: account.auto_reply_message || '',
    monitor_keywords: account.monitor_keywords?.join(', ') || '',
    cookies: account.cookie || ''
  });

  // Estados para rotinas
  const [routines, setRoutines] = useState<RoutineData[]>([]);
  const [newRoutine, setNewRoutine] = useState({
    name: '',
    description: '',
    trigger_type: 'manual' as const,
    actions: []
  });

  // Estados para ações rápidas
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [actionData, setActionData] = useState({
    target: '',
    message: '',
    hashtags: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadRoutines();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, account.id]);

  const loadRoutines = async () => {
    try {
      // Simular carregamento de rotinas - substituir por chamada real à API
      const mockRoutines: RoutineData[] = [
        {
          id: '1',
          name: 'Auto Like Diário',
          description: 'Curtir posts com hashtags específicas',
          trigger_type: 'schedule',
          actions: [],
          is_active: true,
          status: 'active',
          last_executed: '2 horas atrás',
          next_execution: 'Em 4 horas'
        }
      ];
      setRoutines(mockRoutines);
    } catch (err) {
      setError('Erro ao carregar rotinas');
    }
  };

  const handleAccountSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updateData: Partial<InstagramAccount> = {
        username: accountData.username,
        auth_type: accountData.auth_type,
        auto_reply_enabled: accountData.auto_reply_enabled,
        auto_reply_message: accountData.auto_reply_message || null,
        monitor_keywords: accountData.monitor_keywords 
          ? accountData.monitor_keywords.split(',').map(k => k.trim()).filter(k => k)
          : null,
        cookie: accountData.cookies || null,
        updated_at: new Date().toISOString()
      };

      await onAccountUpdate(account.id, updateData);
      setSuccess('Dados da conta atualizados com sucesso!');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao salvar dados da conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoutine = async () => {
    if (!newRoutine.name.trim()) {
      setError('Nome da rotina é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      // Simular criação de rotina - substituir por chamada real à API
      const routine: RoutineData = {
        id: Date.now().toString(),
        ...newRoutine,
        is_active: true,
        status: 'active'
      };
      
      setRoutines(prev => [...prev, routine]);
      setNewRoutine({ name: '', description: '', trigger_type: 'manual', actions: [] });
      setSuccess('Rotina criada com sucesso!');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao criar rotina');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedAction || !actionData.target.trim()) {
      setError('Selecione uma ação e preencha os dados necessários');
      return;
    }

    setIsLoading(true);
    try {
      // Simular execução de ação - substituir por chamada real à API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(`Ação "${selectedAction.name}" executada com sucesso!`);
      setActionData({ target: '', message: '', hashtags: '' });
      setSelectedAction(null);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao executar ação');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Gerenciar Conta @{account.username}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Dados da Conta
            </TabsTrigger>
            <TabsTrigger value="routines" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Rotinas
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Ações Rápidas
            </TabsTrigger>
          </TabsList>

          {/* Aba de Dados da Conta */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <Input
                      id="username"
                      value={accountData.username}
                      onChange={(e) => setAccountData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="auth_type">Tipo de Autenticação</Label>
                    <Select
                      value={accountData.auth_type}
                      onValueChange={(value) => setAccountData(prev => ({ ...prev, auth_type: value as 'credentials' | 'cookie' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credentials">Credenciais (Usuário/Senha)</SelectItem>
                        <SelectItem value="cookie">Cookie de Sessão</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      {accountData.auth_type === 'credentials' 
                        ? 'Usar nome de usuário e senha para login'
                        : 'Usar cookies de sessão para autenticação'
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="auto_reply"
                      checked={accountData.auto_reply_enabled}
                      onChange={(e) => setAccountData(prev => ({ ...prev, auto_reply_enabled: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="auto_reply">Resposta Automática Ativada</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="auto_reply_message">Mensagem de Resposta Automática</Label>
                  <Textarea
                    id="auto_reply_message"
                    value={accountData.auto_reply_message}
                    onChange={(e) => setAccountData(prev => ({ ...prev, auto_reply_message: e.target.value }))}
                    placeholder="Digite a mensagem automática..."
                    disabled={!accountData.auto_reply_enabled}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="monitor_keywords">Palavras-chave para Monitoramento</Label>
                  <Input
                    id="monitor_keywords"
                    value={accountData.monitor_keywords}
                    onChange={(e) => setAccountData(prev => ({ ...prev, monitor_keywords: e.target.value }))}
                    placeholder="palavra1, palavra2, palavra3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separe as palavras-chave com vírgulas
                  </p>
                </div>

                {accountData.auth_type === 'cookie' && (
                  <div>
                    <Label htmlFor="cookies" className="flex items-center gap-2">
                      <Cookie className="w-4 h-4" />
                      Cookies da Sessão
                    </Label>
                    <Textarea
                      id="cookies"
                      value={accountData.cookies}
                      onChange={(e) => setAccountData(prev => ({ ...prev, cookies: e.target.value }))}
                      placeholder="Cole aqui os cookies da sessão do Instagram..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Os cookies serão salvos de forma segura no campo cookie
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleAccountSave} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Rotinas */}
          <TabsContent value="routines" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Rotina</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="routine_name">Nome da Rotina</Label>
                    <Input
                      id="routine_name"
                      value={newRoutine.name}
                      onChange={(e) => setNewRoutine(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Auto Like Diário"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trigger_type">Tipo de Gatilho</Label>
                    <Select 
                      value={newRoutine.trigger_type} 
                      onValueChange={(value: any) => setNewRoutine(prev => ({ ...prev, trigger_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="schedule">Agendado</SelectItem>
                        <SelectItem value="event">Por Evento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="routine_description">Descrição</Label>
                  <Textarea
                    id="routine_description"
                    value={newRoutine.description}
                    onChange={(e) => setNewRoutine(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o que esta rotina faz..."
                    rows={2}
                  />
                </div>

                <Button 
                  onClick={handleCreateRoutine} 
                  disabled={isLoading || !newRoutine.name.trim()}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Criando...' : 'Criar Rotina'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rotinas Existentes ({routines.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {routines.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma rotina criada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {routines.map((routine) => (
                      <div key={routine.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{routine.name}</h4>
                            <p className="text-sm text-muted-foreground">{routine.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={routine.is_active ? 'default' : 'secondary'}>
                              {routine.is_active ? 'Ativa' : 'Inativa'}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {routine.last_executed && (
                          <div className="text-xs text-muted-foreground">
                            Última execução: {routine.last_executed} | 
                            Próxima: {routine.next_execution || 'Não agendada'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Ações Rápidas */}
          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Executar Ação Rápida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selecione uma Ação</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <div
                          key={action.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedAction?.id === action.id
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedAction(action)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium">{action.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedAction && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-medium flex items-center gap-2">
                      <selectedAction.icon className="w-4 h-4" />
                      {selectedAction.name}
                    </h4>

                    <div>
                      <Label htmlFor="action_target">Alvo da Ação</Label>
                      <Input
                        id="action_target"
                        value={actionData.target}
                        onChange={(e) => setActionData(prev => ({ ...prev, target: e.target.value }))}
                        placeholder={
                          selectedAction.type === 'like' ? 'URL do post ou hashtag' :
                          selectedAction.type === 'follow' ? 'Nome de usuário' :
                          selectedAction.type === 'comment' ? 'URL do post' :
                          'Alvo da ação'
                        }
                      />
                    </div>

                    {(selectedAction.type === 'comment' || selectedAction.type === 'message') && (
                      <div>
                        <Label htmlFor="action_message">Mensagem</Label>
                        <Textarea
                          id="action_message"
                          value={actionData.message}
                          onChange={(e) => setActionData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Digite sua mensagem..."
                          rows={3}
                        />
                      </div>
                    )}

                    {selectedAction.type === 'upload' && (
                      <div>
                        <Label htmlFor="action_hashtags">Hashtags</Label>
                        <Input
                          id="action_hashtags"
                          value={actionData.hashtags}
                          onChange={(e) => setActionData(prev => ({ ...prev, hashtags: e.target.value }))}
                          placeholder="#hashtag1 #hashtag2 #hashtag3"
                        />
                      </div>
                    )}

                    <Button 
                      onClick={handleExecuteAction} 
                      disabled={isLoading || !actionData.target.trim()}
                      className="w-full"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {isLoading ? 'Executando...' : `Executar ${selectedAction.name}`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}