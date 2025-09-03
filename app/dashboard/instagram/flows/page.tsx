'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Play, 
  Clock,
  ArrowLeft,
  Workflow
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Workflow as WorkflowType } from '@/lib/types/workflow';
import { InstagramAccount } from '@/lib/types/instagram-accounts';

interface WorkflowRecord {
  id: string;
  user_id: string;
  workflow: WorkflowType;
  created_at: string;
  updated_at: string;
}

export default function WorkflowsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    loadWorkflows();
    loadInstagramAccounts();
  }, [user, authLoading, router]);

  const loadInstagramAccounts = async () => {
    try {
      const response = await fetch('/api/instagram-accounts');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar contas');
      }

      setInstagramAccounts(result.data || []);
      // Selecionar a primeira conta por padrão
      if (result.data && result.data.length > 0) {
        setSelectedAccountId(result.data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar contas do Instagram:', error);
    }
  };

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/workflows');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro na requisição');
      }

      setWorkflows(result.data || []);
    } catch (error) {
      console.error('Erro ao carregar workflows:', error);
      setError(`Erro ao carregar workflows: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Tem certeza que deseja excluir este workflow?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    } catch (error) {
      console.error('Erro ao excluir workflow:', error);
      alert('Erro ao excluir workflow.');
    }
  };

  const startWorkflow = async (workflowId: string) => {
    if (!selectedAccountId) {
      alert('Por favor, selecione uma conta do Instagram primeiro.');
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${workflowId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: selectedAccountId
        }),
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

  const filteredWorkflows = workflows.filter(workflow => {
    if (!workflow?.workflow) return false;
    
    const name = workflow.workflow.name || '';
    const description = workflow.workflow.description || '';
    
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {authLoading ? 'Verificando autenticação...' : 'Carregando workflows...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/instagram')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Workflow className="w-6 h-6" />
                  Workflows
                </h1>
                <p className="text-gray-600">Gerencie seus workflows de automação</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/dashboard/instagram/flows/create')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Workflow
            </Button>
          </div>
        </div>

        {/* Search and Account Selection */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-64">
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {instagramAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        @{account.username}
                        {account.is_logged_in && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Online
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="text-red-600 text-center">
                <p>{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadWorkflows}
                  className="mt-2"
                >
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflows List */}
        <div className="grid gap-4">
          {filteredWorkflows.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum workflow encontrado' : 'Nenhum workflow criado'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca' 
                    : 'Crie seu primeiro workflow de automação'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => router.push('/dashboard/instagram/flows/create')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Criar Workflow
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredWorkflows.map((workflowRecord) => {
              const workflow = workflowRecord.workflow;
              return (
                <Card key={workflowRecord.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {workflow.name}
                          </h3>
                          <Badge variant="outline">
                            {workflow.steps?.length || 0} step{(workflow.steps?.length || 0) !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        
                        {workflow.description && (
                          <p className="text-gray-600 mb-3">
                            {workflow.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Atualizado em {formatDate(workflowRecord.updated_at)}
                          </div>
                          {workflow.instanceName && (
                            <div>
                              Instância: @{workflow.instanceName}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => startWorkflow(workflowRecord.id)}
                          className="flex items-center gap-1"
                        >
                          <Play className="w-4 h-4" />
                          Executar
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/instagram/flows/edit/${workflowRecord.id}`)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteWorkflow(workflowRecord.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}