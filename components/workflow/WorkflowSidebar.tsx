'use client';

import React, { useState } from 'react';
import { 
  Workflow, 
  WorkflowStep, 
  WorkflowAction, 
  WorkflowActionType,
  WorkflowActionParams 
} from '@/lib/types/workflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, ArrowDown } from 'lucide-react';

interface WorkflowSidebarProps {
  workflow: Workflow;
  selectedStep?: WorkflowStep;
  onWorkflowChange: (workflow: Workflow) => void;
  onStepChange: (step: WorkflowStep) => void;
}

const actionTypes: { value: WorkflowActionType; label: string }[] = [
  { value: 'sendDirectMessage', label: 'Enviar Mensagem Direta' },
  { value: 'likePost', label: 'Curtir Post' },
  { value: 'followUser', label: 'Seguir Usuário' },
  { value: 'unfollowUser', label: 'Deixar de Seguir' },
  { value: 'comment', label: 'Comentar' },
  { value: 'monitorMessages', label: 'Monitorar Mensagens' },
  { value: 'monitorPosts', label: 'Monitorar Posts' },
  { value: 'delay', label: 'Aguardar' },
  { value: 'startMessageProcessor', label: 'Iniciar Processador de Mensagens' },
  { value: 'stopMessageProcessor', label: 'Parar Processador de Mensagens' },
];

export default function WorkflowSidebar({ 
  workflow, 
  selectedStep, 
  onWorkflowChange, 
  onStepChange 
}: WorkflowSidebarProps) {
  const [newActionType, setNewActionType] = useState<WorkflowActionType>('sendDirectMessage');

  const updateWorkflow = (updates: Partial<Workflow>) => {
    onWorkflowChange({ ...workflow, ...updates });
  };

  const updateStep = (updates: Partial<WorkflowStep>) => {
    if (!selectedStep) return;
    const updatedStep = { ...selectedStep, ...updates };
    onStepChange(updatedStep);
  };

  const addAction = () => {
    if (!selectedStep) return;
    
    const defaultParams = getDefaultParams(newActionType);
    const newAction: WorkflowAction = {
      type: newActionType,
      params: defaultParams,
      description: ''
    };
    
    updateStep({
      actions: [...selectedStep.actions, newAction]
    });
  };

  const updateAction = (index: number, updates: Partial<WorkflowAction>) => {
    if (!selectedStep) return;
    
    const updatedActions = [...selectedStep.actions];
    updatedActions[index] = { ...updatedActions[index], ...updates };
    
    updateStep({ actions: updatedActions });
  };

  const removeAction = (index: number) => {
    if (!selectedStep) return;
    
    const updatedActions = selectedStep.actions.filter((_, i) => i !== index);
    updateStep({ actions: updatedActions });
  };

  const getDefaultParams = (type: WorkflowActionType): any => {
    switch (type) {
      case 'sendDirectMessage':
        return { user: '', message: '' };
      case 'likePost':
        return { postId: '' };
      case 'followUser':
        return { username: '' };
      case 'unfollowUser':
        return { username: '' };
      case 'comment':
        return { postId: '', comment: '' };
      case 'monitorMessages':
        return { keywords: [] };
      case 'monitorPosts':
        return { 
          hashtags: [], 
          usernames: [],
          checkInterval: 30000, // 30 segundos
          maxExecutions: 10,
          maxPostsPerUser: 5
        };
      case 'delay':
        return { duration: 60000 }; // em milissegundos
      case 'startMessageProcessor':
        return { aiConfig: {}, processingConfig: {} };
      case 'stopMessageProcessor':
        return {};
      default:
        return {};
    }
  };

  const renderActionParams = (action: WorkflowAction, index: number) => {
    const updateParams = (newParams: any) => {
      updateAction(index, { params: { ...action.params, ...newParams } });
    };

    switch (action.type) {
      case 'sendDirectMessage':
        const dmParams = action.params as any;
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Usuário</Label>
              <Input
                value={dmParams.user || ''}
                onChange={(e) => updateParams({ user: e.target.value })}
                placeholder="@usuario"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Mensagem</Label>
              <Textarea
                value={dmParams.message || ''}
                onChange={(e) => updateParams({ message: e.target.value })}
                placeholder="Sua mensagem..."
                className="h-16 text-xs resize-none"
              />
            </div>
          </div>
        );
      
      case 'likePost':
        const likeParams = action.params as any;
        return (
          <div>
            <Label className="text-xs">URL do Post</Label>
            <Input
              value={likeParams.postId || ''}
              onChange={(e) => updateParams({ postId: e.target.value })}
              placeholder="https://instagram.com/p/..."
              className="h-8 text-xs"
            />
          </div>
        );
      
      case 'followUser':
      case 'unfollowUser':
        const userParams = action.params as any;
        return (
          <div>
            <Label className="text-xs">Usuário</Label>
            <Input
              value={userParams.username || ''}
              onChange={(e) => updateParams({ username: e.target.value })}
              placeholder="@usuario"
              className="h-8 text-xs"
            />
          </div>
        );
      
      case 'comment':
        const commentParams = action.params as any;
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">URL do Post</Label>
              <Input
                value={commentParams.postId || ''}
                onChange={(e) => updateParams({ postId: e.target.value })}
                placeholder="https://instagram.com/p/..."
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Comentário</Label>
              <Textarea
                value={commentParams.comment || ''}
                onChange={(e) => updateParams({ comment: e.target.value })}
                placeholder="Seu comentário..."
                className="h-16 text-xs resize-none"
              />
            </div>
          </div>
        );
      
      case 'monitorPosts':
        const monitorPostsParams = action.params as any;
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Hashtags</Label>
              <Input
                value={(monitorPostsParams.hashtags || []).join(', ')}
                onChange={(e) => updateParams({ hashtags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                placeholder="#tag1, #tag2, #tag3"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Usuários</Label>
              <Input
                value={(monitorPostsParams.usernames || []).join(', ')}
                onChange={(e) => updateParams({ usernames: e.target.value.split(',').map(user => user.trim()).filter(user => user) })}
                placeholder="@usuario1, @usuario2"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Máximo de Posts</Label>
              <Input
                type="number"
                value={monitorPostsParams.maxPosts || ''}
                onChange={(e) => updateParams({ maxPosts: parseInt(e.target.value) || undefined })}
                placeholder="10"
                className="h-8 text-xs"
                min="1"
              />
            </div>
            <div>
              <Label className="text-xs">Intervalo de Verificação (ms)</Label>
              <Input
                type="number"
                value={monitorPostsParams.checkInterval || 30000}
                onChange={(e) => updateParams({ checkInterval: parseInt(e.target.value) || 30000 })}
                placeholder="30000"
                className="h-8 text-xs"
                min="1000"
              />
            </div>
            <div>
              <Label className="text-xs">Máximo de Execuções</Label>
              <Input
                type="number"
                value={monitorPostsParams.maxExecutions || 10}
                onChange={(e) => updateParams({ maxExecutions: parseInt(e.target.value) || 10 })}
                placeholder="10"
                className="h-8 text-xs"
                min="1"
              />
            </div>
            <div>
              <Label className="text-xs">Posts por Usuário</Label>
              <Input
                type="number"
                value={monitorPostsParams.maxPostsPerUser || 5}
                onChange={(e) => updateParams({ maxPostsPerUser: parseInt(e.target.value) || 5 })}
                placeholder="5"
                className="h-8 text-xs"
                min="1"
              />
            </div>
          </div>
        );
      
      case 'delay':
        const delayParams = action.params as any;
        
        // Converter milissegundos para unidade mais amigável
        const durationMs = delayParams.duration || 60000;
        let displayValue: number;
        let currentUnit: string;
        
        if (durationMs >= 3600000) { // >= 1 hora
          displayValue = Math.round(durationMs / 3600000 * 100) / 100;
          currentUnit = 'hours';
        } else if (durationMs >= 60000) { // >= 1 minuto
          displayValue = Math.round(durationMs / 60000 * 100) / 100;
          currentUnit = 'minutes';
        } else { // segundos
          displayValue = Math.round(durationMs / 1000 * 100) / 100;
          currentUnit = 'seconds';
        }
        
        const handleDurationChange = (value: string, unit: string) => {
          const numValue = parseFloat(value) || 0;
          let newDurationMs: number;
          
          switch (unit) {
            case 'hours':
              newDurationMs = numValue * 3600000;
              break;
            case 'minutes':
              newDurationMs = numValue * 60000;
              break;
            case 'seconds':
            default:
              newDurationMs = numValue * 1000;
              break;
          }
          
          updateParams({ duration: Math.max(1000, newDurationMs) }); // Mínimo 1 segundo
        };
        
        return (
          <div className="space-y-2">
            <Label className="text-xs">Duração</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={displayValue}
                onChange={(e) => handleDurationChange(e.target.value, currentUnit)}
                className="h-8 text-xs flex-1"
                min="0.1"
                step="0.1"
                placeholder="0"
              />
              <Select
                value={currentUnit}
                onValueChange={(unit) => handleDurationChange(displayValue.toString(), unit)}
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">seg</SelectItem>
                  <SelectItem value="minutes">min</SelectItem>
                  <SelectItem value="hours">hrs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-gray-500">
              = {Math.round(durationMs).toLocaleString()} ms
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-xs text-gray-500">
            Configuração não implementada para este tipo de ação
          </div>
        );
    }
  };

  if (!selectedStep) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurações do Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>ID</Label>
              <Input
                value={workflow.id}
                onChange={(e) => updateWorkflow({ id: e.target.value })}
                placeholder="workflow-id"
              />
            </div>
            
            <div>
              <Label>Nome</Label>
              <Input
                value={workflow.name}
                onChange={(e) => updateWorkflow({ name: e.target.value })}
                placeholder="Nome do workflow"
              />
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={workflow.description || ''}
                onChange={(e) => updateWorkflow({ description: e.target.value })}
                placeholder="Descrição do workflow"
                className="resize-none"
              />
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-sm font-medium">Configurações Avançadas</Label>
              <div className="mt-2 space-y-2">
                <div>
                  <Label className="text-xs">Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={workflow.config?.timeout || 300000}
                    onChange={(e) => updateWorkflow({ 
                      config: { 
                        ...workflow.config, 
                        timeout: parseInt(e.target.value) || 300000 
                      } 
                    })}
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Parar em caso de erro</Label>
                  <Select
                    value={workflow.config?.stopOnError ? 'true' : 'false'}
                    onValueChange={(value: string) => 
                      updateWorkflow({ 
                        config: { 
                          ...workflow.config, 
                          stopOnError: value === 'true' 
                        } 
                      })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-sm font-medium mb-3 block">Ordem dos Steps</Label>
              <div className="text-xs text-gray-600 mb-3">
                A ordem é determinada automaticamente pelas conexões entre os nós no canvas.
              </div>
              
              {workflow.steps.length > 0 ? (
                <div className="space-y-2">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Badge variant="outline" className="text-xs min-w-[24px] justify-center">
                        {index + 1}
                      </Badge>
                      <div className="flex-1 text-xs font-medium truncate">
                        {step.name}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {step.actions.length} ações
                      </Badge>
                      {index < workflow.steps.length - 1 && (
                        <ArrowDown className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500 italic">
                  Nenhum step criado ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configurações do Step</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              value={selectedStep.name}
              onChange={(e) => updateStep({ name: e.target.value })}
              placeholder="Nome do step"
            />
          </div>
          
          <div>
            <Label>Condição (opcional)</Label>
            <Input
              value={selectedStep.condition || ''}
              onChange={(e) => updateStep({ condition: e.target.value })}
              placeholder="ex: success == true"
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium">Retry (opcional)</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Max tentativas</Label>
                <Input
                  type="number"
                  value={selectedStep.retry?.maxAttempts || 1}
                  onChange={(e) => updateStep({ 
                    retry: { 
                      ...selectedStep.retry, 
                      maxAttempts: parseInt(e.target.value) || 1,
                      delaySeconds: selectedStep.retry?.delaySeconds || 5
                    } 
                  })}
                  className="h-8"
                  min="1"
                />
              </div>
              <div>
                <Label className="text-xs">Delay (ms)</Label>
                <Input
                  type="number"
                  value={selectedStep.retry?.delayMs || 5000}
                  onChange={(e) => updateStep({ 
                    retry: { 
                      ...selectedStep.retry, 
                      maxAttempts: selectedStep.retry?.maxAttempts || 1,
                      delayMs: parseInt(e.target.value) || 5000
                    } 
                  })}
                  className="h-8"
                  min="1"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Ações</Label>
              <Badge variant="secondary">{selectedStep.actions.length}</Badge>
            </div>
            
            <div className="space-y-3">
              {selectedStep.actions.map((action, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="text-xs">
                      {actionTypes.find(t => t.value === action.type)?.label || action.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      onClick={() => removeAction(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Descrição</Label>
                      <Input
                        value={action.description || ''}
                        onChange={(e) => updateAction(index, { description: e.target.value })}
                        placeholder="Descrição da ação"
                        className="h-8 text-xs"
                      />
                    </div>
                    
                    {renderActionParams(action, index)}
                  </div>
                </Card>
              ))}
              
              <div className="flex gap-2">
                <Select value={newActionType} onValueChange={setNewActionType}>
                  <SelectTrigger className="h-8 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={addAction}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}