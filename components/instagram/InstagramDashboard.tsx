'use client';

// Instagram hooks removidos - componente em modo mock
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { InstagramControl } from './InstagramControl';
import { InstagramActions } from './InstagramActions';
import { Activity, Users, MessageCircle, Heart, Camera, Eye, User } from 'lucide-react';

interface InstagramDashboardProps {
  className?: string;
}

export function InstagramDashboard({ className }: InstagramDashboardProps) {
  // Hooks removidos - dados mockados
  const state = { accounts: [], activeAccountId: null };
  const getActiveAccount = () => null;
  const switchAccount = async () => {};
  const stats = { totalAccounts: 0, activeAccounts: 0, totalActions: 0, todayActions: 0 };
  
  const activeAccount = getActiveAccount();
  const activeStats = activeAccount ? stats[activeAccount.id] : null;

  const formatDate = (dateString: string) => {
    // Usar formato consistente para evitar problemas de hidratação
    const date = new Date(dateString);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  const getAccountStatusColor = (account: any) => {
    if (account.isLoggedIn && account.isMonitoring) return 'bg-green-500';
    if (account.isLoggedIn) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAccountStatusText = (account: any) => {
    if (account.isLoggedIn && account.isMonitoring) return 'Ativo';
    if (account.isLoggedIn) return 'Conectado';
    return 'Desconectado';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard do Instagram</h2>
          <p className="text-gray-600">
            Gerencie suas atividades e monitore mensagens em múltiplas contas
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Account Overview */}
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {state.accounts.length} conta{state.accounts.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {activeAccount && (
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getAccountStatusColor(activeAccount)}`} />
              <Badge variant={activeAccount.isLoggedIn ? 'default' : 'secondary'}>
                @{activeAccount.username} - {getAccountStatusText(activeAccount)}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Account Selector */}
      {state.accounts.length > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Conta Ativa</h3>
              <p className="text-sm text-gray-600">Selecione a conta para visualizar dados específicos</p>
            </div>
            <div className="w-64">
              <Select value={activeAccount?.id || ''} onValueChange={switchAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {state.accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getAccountStatusColor(account)}`} />
                        @{account.username}
                        <span className="text-xs text-gray-500">
                          ({account.authType === 'credentials' ? 'Credenciais' : 'Cookie'})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* No Account Selected */}
      {!activeAccount && (
        <Card className="p-8 text-center">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma conta selecionada</h3>
          <p className="text-gray-600 mb-4">
            {state.accounts.length === 0 
              ? 'Adicione uma conta do Instagram para começar'
              : 'Selecione uma conta para visualizar o dashboard'
            }
          </p>
        </Card>
      )}

      {/* Stats Cards */}
      {activeAccount && activeStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Curtidas</p>
                <p className="text-2xl font-bold">{activeStats.likes}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Comentários</p>
                <p className="text-2xl font-bold">{activeStats.comments}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Seguidores</p>
                <p className="text-2xl font-bold">{activeStats.follows}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Posts</p>
                <p className="text-2xl font-bold">{activeStats.posts}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="control" className="space-y-4">
        <TabsList>
          <TabsTrigger value="control">Controle</TabsTrigger>
          <TabsTrigger value="actions" disabled={!activeAccount}>
            Ações {!activeAccount && '(Selecione uma conta)'}
          </TabsTrigger>
          <TabsTrigger value="activity" disabled={!activeAccount}>
            Atividade {!activeAccount && '(Selecione uma conta)'}
          </TabsTrigger>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        </TabsList>
        
        <TabsContent value="control">
          <InstagramControl />
        </TabsContent>
        
        <TabsContent value="actions">
          {activeAccount ? (
            <InstagramActions />
          ) : (
            <Card className="p-8 text-center">
              <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Selecione uma conta para executar ações</p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="activity">
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5" />
              <h3 className="text-lg font-semibold">
                Log de Atividades
                {activeAccount && ` - @${activeAccount.username}`}
              </h3>
            </div>
            
            {!activeAccount ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Selecione uma conta para ver o log de atividades</p>
              </div>
            ) : activeAccount.activityLog.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma atividade registrada ainda para @{activeAccount.username}
              </p>
            ) : (
              <div className="space-y-3">
                {activeAccount.activityLog.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.success ? 'default' : 'destructive'}>
                        {activity.success ? 'Sucesso' : 'Erro'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* All Accounts Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Todas as Contas</h3>
              {state.accounts.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Nenhuma conta adicionada ainda</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {state.accounts.map((account) => {
                    const accountStats = stats[account.id];
                    return (
                      <div key={account.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getAccountStatusColor(account)}`} />
                            <div>
                              <h4 className="font-medium">@{account.username}</h4>
                              <p className="text-sm text-gray-600">
                                {account.authType === 'credentials' ? 'Credenciais' : 'Cookie'} • 
                                {getAccountStatusText(account)}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => switchAccount(account.id)}
                            disabled={activeAccount?.id === account.id}
                          >
                            {activeAccount?.id === account.id ? 'Ativa' : 'Selecionar'}
                          </Button>
                        </div>
                        
                        {accountStats && (
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-lg font-bold text-red-500">{accountStats.likes}</p>
                              <p className="text-xs text-gray-600">Curtidas</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-blue-500">{accountStats.comments}</p>
                              <p className="text-xs text-gray-600">Comentários</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-green-500">{accountStats.follows}</p>
                              <p className="text-xs text-gray-600">Seguidores</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-purple-500">{accountStats.posts}</p>
                              <p className="text-xs text-gray-600">Posts</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}