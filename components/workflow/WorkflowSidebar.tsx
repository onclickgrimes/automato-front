'use client';

import React, { useState, useEffect } from 'react';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { 
  Workflow, 
  WorkflowStep, 
  WorkflowAction, 
  WorkflowActionType
} from '@/lib/types/workflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, ArrowDown, Variable } from 'lucide-react';
import { actionConfig } from '@/lib/config/workflow-actions';
import VariablePicker from './VariablePicker';

interface WorkflowSidebarProps {
  workflow: Workflow;
  selectedStep?: WorkflowStep;
  onWorkflowChange: (workflow: Workflow) => void;
  onStepChange: (step: WorkflowStep) => void;
}

// Usar configuração centralizada para tipos de ação
const actionTypes: { value: WorkflowActionType; label: string }[] = 
  Object.entries(actionConfig).map(([key, config]) => ({
    value: key as WorkflowActionType,
    label: config.label
  }));

export default function WorkflowSidebar({ 
  workflow, 
  selectedStep, 
  onWorkflowChange, 
  onStepChange 
}: WorkflowSidebarProps) {
  const [isVariablePickerOpen, setIsVariablePickerOpen] = useState(false);
  // Hook deve ser chamado no nível superior do componente
  const { uploading, error, uploadFile, clearError } = useFileUpload();
  const [newActionType, setNewActionType] = useState<WorkflowActionType>('sendDirectMessage');

  // Função para detectar o tipo de dados baseado na variável selecionada
  const getDataTypeFromVariable = (variable: string): 'users' | 'posts' | 'unknown' => {
    if (!variable) return 'unknown';
    
    // Detectar baseado no nome da variável
    const lowerVar = variable.toLowerCase();
    if (lowerVar.includes('users') || lowerVar.includes('followers') || lowerVar.includes('following')) {
      return 'users';
    }
    if (lowerVar.includes('posts') || lowerVar.includes('posts') || lowerVar.includes('media')) {
      return 'posts';
    }
    
    return 'unknown';
  };

  // Função para filtrar ações compatíveis com o tipo de dados
  const getCompatibleActions = (dataType: 'users' | 'posts' | 'unknown'): WorkflowActionType[] => {
    switch (dataType) {
      case 'users':
        return ['followUser', 'unfollowUser', 'sendDirectMessage', 'delay'];
      case 'posts':
        return ['likePost', 'comment', 'delay'];
      case 'unknown':
      default:
        return ['followUser', 'unfollowUser', 'sendDirectMessage', 'likePost', 'comment', 'delay'];
    }
  };

  // Função para validar se uma variável é compatível com um campo específico
  const isVariableCompatible = (variable: string, fieldType: 'user' | 'post'): boolean => {
    if (!variable) return true; // Permite valores vazios
    
    // Se não é uma variável (não contém {{}}), permite
    if (!variable.includes('{{') || !variable.includes('}}')) return true;
    
    const dataType = getDataTypeFromVariable(variable);
    
    switch (fieldType) {
      case 'user':
        return dataType === 'users' || dataType === 'unknown';
      case 'post':
        return dataType === 'posts' || dataType === 'unknown';
      default:
        return true;
    }
  };

  // Função para obter variáveis compatíveis com um tipo específico
  const getCompatibleVariables = (fieldType: 'user' | 'post'): string[] => {
    const allVariables = workflow.steps.flatMap(step => 
      step.actions.flatMap(action => {
        const variables: string[] = [];
        
        // Extrair variáveis de diferentes tipos de ação
        if (action.type === 'getFollowers' || action.type === 'getFollowing') {
          const params = action.params as any;
          if (params.outputVariable) variables.push(params.outputVariable);
        }
        if (action.type === 'monitorPosts') {
          const params = action.params as any;
          if (params.outputVariable) variables.push(params.outputVariable);
        }
        
        return variables;
      })
    );
    
    return allVariables.filter(variable => isVariableCompatible(`{{${variable}}}`, fieldType));
  };

  // Auto-preencher campos que usam {{item}} nas ações aninhadas do forEach
  useEffect(() => {
    if (!selectedStep) return;
    
    const forEachActions = selectedStep.actions.filter(action => action.type === 'forEach');
    let hasChanges = false;
    
    forEachActions.forEach((forEachAction, actionIndex) => {
      const forEachParams = forEachAction.params as any;
      const nestedActions = forEachParams.actions || [];
      
      nestedActions.forEach((nestedAction: any, nestedIndex: number) => {
        const autoFillParams: any = {};
        
        switch (nestedAction.type) {
          case 'followUser':
          case 'unfollowUser':
            if (!nestedAction.params.username) {
              autoFillParams.username = '{{item}}';
            }
            break;
          case 'sendDirectMessage':
            if (!nestedAction.params.user) {
              autoFillParams.user = '{{item}}';
            }
            break;
          case 'likePost':
          case 'comment':
            if (!nestedAction.params.postId) {
              autoFillParams.postId = '{{item.id}}';
            }
            break;
        }
        
        if (Object.keys(autoFillParams).length > 0) {
          const updatedActions = [...selectedStep.actions];
          const currentForEachAction = updatedActions[actionIndex];
          const currentNestedActions = [...(currentForEachAction.params as any).actions];
          currentNestedActions[nestedIndex] = {
            ...currentNestedActions[nestedIndex],
            params: { ...currentNestedActions[nestedIndex].params, ...autoFillParams }
          };
          updatedActions[actionIndex] = {
            ...currentForEachAction,
            params: { ...currentForEachAction.params, actions: currentNestedActions }
          };
          onStepChange({ ...selectedStep, actions: updatedActions });
          hasChanges = true;
        }
      });
    });
  }, [selectedStep?.actions, selectedStep?.id]);

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
          maxExecutions: 1,
          maxPostsPerUser: 6,
          maxPostAge: 24,
          maxPostAgeUnit: 'hours'
        };
      case 'delay':
        return { duration: 60000 }; // em milissegundos
      case 'startMessageProcessor':
        return { aiConfig: {}, processingConfig: {} };
      case 'stopMessageProcessor':
        return {};
      case 'if':
        return { 
          variable: '', 
          operator: 'equals', 
          value: '' 
        };
      case 'forEach':
        return { 
          list: '', 
          actions: [] 
        };
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
        const isDmUserVariableValid = isVariableCompatible(dmParams.user || '', 'user');
        
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs flex items-center gap-2">
                Usuário
                {!isDmUserVariableValid && (
                  <span className="text-red-500 text-xs">⚠️ Variável incompatível</span>
                )}
              </Label>
              <div className="flex gap-1">
                <Input
                  value={dmParams.user || ''}
                  onChange={(e) => updateParams({ user: e.target.value })}
                  placeholder="@usuario"
                  className={`h-8 text-xs flex-1 ${!isDmUserVariableValid ? 'border-red-300' : ''}`}
                />
                <VariablePicker
                  workflow={workflow}
                  onVariableSelect={(variable) => updateParams({ user: `{{${variable}}}` })}
                  filterVariables={(variables) => variables.filter(v => isVariableCompatible(`{{${v}}}`, 'user'))}
                >
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <Variable className="h-3 w-3" />
                  </Button>
                </VariablePicker>
              </div>
              {!isDmUserVariableValid && (
                <div className="text-xs text-red-600 mt-1">
                  Esta variável contém dados de posts, mas este campo espera nomes de usuários.
                </div>
              )}
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
      
      case 'if':
        const ifParams = action.params as any;
        
        // Obter steps anteriores ao step atual
        const currentStepIndex = workflow.steps.findIndex(s => s.id === selectedStep?.id);
        const previousSteps = currentStepIndex > 0 ? workflow.steps.slice(0, currentStepIndex) : [];
        
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Variável</Label>
              <div className="flex gap-2">
                <Input
                  value={ifParams.variable || ''}
                  onChange={(e) => updateParams({ variable: e.target.value })}
                  placeholder="{{steps.step-1.result.data}}"
                  className="h-8 text-xs flex-1"
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVariablePickerOpen(true)}
                  className="h-8 px-3"
                >
                  <Variable className="w-3 h-3 mr-1" />
                  Selecionar
                </Button>
              </div>
            </div>
            
            <VariablePicker
              isOpen={isVariablePickerOpen}
              setIsOpen={setIsVariablePickerOpen}
              steps={previousSteps}
              onVariableSelect={(variable) => {
                updateParams({ variable });
              }}
            />
            <div>
              <Label className="text-xs">Operador</Label>
              <Select
                value={ifParams.operator || 'equals'}
                onValueChange={(value) => updateParams({ operator: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Igual a</SelectItem>
                  <SelectItem value="notEquals">Diferente de</SelectItem>
                  <SelectItem value="isEmpty">Está vazio</SelectItem>
                  <SelectItem value="isNotEmpty">Não está vazio</SelectItem>
                  <SelectItem value="greaterThan">Maior que</SelectItem>
                  <SelectItem value="lessThan">Menor que</SelectItem>
                  <SelectItem value="contains">Contém</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!['isEmpty', 'isNotEmpty'].includes(ifParams.operator || '') && (
              <div>
                <Label className="text-xs">Valor</Label>
                <Input
                  value={ifParams.value || ''}
                  onChange={(e) => updateParams({ value: e.target.value })}
                  placeholder="Valor para comparação"
                  className="h-8 text-xs"
                />
              </div>
            )}
          </div>
        );
      
      case 'forEach':
        const forEachParams = action.params as any;
        
        // Obter steps anteriores ao step atual
        const currentStepIndexForEach = workflow.steps.findIndex(s => s.id === selectedStep?.id);
        const previousStepsForEach = currentStepIndexForEach > 0 ? workflow.steps.slice(0, currentStepIndexForEach) : [];
        
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Lista</Label>
              <div className="flex gap-2">
                <Input
                  value={forEachParams.list || ''}
                  onChange={(e) => updateParams({ list: e.target.value })}
                  placeholder="{{steps.step-1.result.users}}"
                  className="h-8 text-xs flex-1"
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVariablePickerOpen(true)}
                  className="h-8 px-3"
                >
                  <Variable className="w-3 h-3 mr-1" />
                  Selecionar
                </Button>
              </div>
            </div>
            

            
            <VariablePicker
              isOpen={isVariablePickerOpen}
              setIsOpen={setIsVariablePickerOpen}
              steps={previousStepsForEach}
              onVariableSelect={(variable) => {
                updateParams({ list: variable });
              }}
            />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Ações do Loop</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentActions = forEachParams.actions || [];
                    const dataType = getDataTypeFromVariable(forEachParams.list || '');
                    const compatibleActions = getCompatibleActions(dataType);
                    const defaultActionType = compatibleActions[0] || 'delay';
                    
                    updateParams({ 
                      actions: [...currentActions, {
                        type: defaultActionType,
                        params: {}
                      }]
                    });
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar Ação
                </Button>
              </div>
              
              {(forEachParams.actions || []).map((nestedAction, nestedIndex) => (
                <Card key={nestedIndex} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-medium">
                        Ação {nestedIndex + 1}: {actionConfig[nestedAction.type]?.label || nestedAction.type}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentActions = forEachParams.actions || [];
                          const newActions = currentActions.filter((_, i) => i !== nestedIndex);
                          updateParams({ actions: newActions });
                        }}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div>
                      <Label className="text-xs">Tipo de Ação</Label>
                      <Select
                        value={nestedAction.type}
                        onValueChange={(value: WorkflowActionType) => {
                          const currentActions = forEachParams.actions || [];
                          const newActions = [...currentActions];
                          newActions[nestedIndex] = {
                            type: value,
                            params: {}
                          };
                          updateParams({ actions: newActions });
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            const dataType = getDataTypeFromVariable(forEachParams.list || '');
                            const compatibleActions = getCompatibleActions(dataType);
                            return actionTypes
                              .filter(at => compatibleActions.includes(at.value))
                              .map((actionType) => (
                                <SelectItem key={actionType.value} value={actionType.value}>
                                  {actionType.label}
                                </SelectItem>
                              ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Renderizar parâmetros específicos da ação aninhada */}
                    {(() => {
                      const updateNestedParams = (newParams: any) => {
                        const currentActions = forEachParams.actions || [];
                        const newActions = [...currentActions];
                        newActions[nestedIndex] = {
                          ...newActions[nestedIndex],
                          params: { ...newActions[nestedIndex].params, ...newParams }
                        };
                        updateParams({ actions: newActions });
                      };
                      
                      // A lógica de auto-preenchimento foi movida para o useEffect no nível superior
                      
                      switch (nestedAction.type) {
                        case 'followUser':
                        case 'unfollowUser':
                          return (
                            <div className="text-xs text-gray-600 p-2 bg-green-50 rounded border border-green-200">
                              ✓ Usuário será obtido automaticamente do item do loop
                            </div>
                          );
                        
                        case 'delay':
                          return (
                            <div>
                              <Label className="text-xs">Duração (ms)</Label>
                              <Input
                                type="number"
                                value={nestedAction.params.duration || ''}
                                onChange={(e) => updateNestedParams({ duration: parseInt(e.target.value) || 0 })}
                                placeholder="5000"
                                className="h-8 text-xs"
                              />
                            </div>
                          );
                        
                        case 'sendDirectMessage':
                          return (
                            <div className="space-y-2">
                              <div className="text-xs text-gray-600 p-2 bg-green-50 rounded border border-green-200">
                                ✓ Usuário será obtido automaticamente do item do loop
                              </div>
                              <div>
                                <Label className="text-xs">Mensagem</Label>
                                <Textarea
                                  value={nestedAction.params.message || ''}
                                  onChange={(e) => updateNestedParams({ message: e.target.value })}
                                  placeholder="Olá! Como você está?"
                                  className="text-xs min-h-[60px]"
                                />
                              </div>
                            </div>
                          );
                        
                        case 'likePost':
                          return (
                            <div className="text-xs text-gray-600 p-2 bg-green-50 rounded border border-green-200">
                              ✓ URL do post será obtida automaticamente do item do loop
                            </div>
                          );
                        
                        case 'comment':
                          return (
                            <div className="space-y-2">
                              <div className="text-xs text-gray-600 p-2 bg-green-50 rounded border border-green-200">
                                ✓ URL do post será obtida automaticamente do item do loop
                              </div>
                              <div>
                                <Label className="text-xs">Comentário</Label>
                                <Textarea
                                  value={nestedAction.params.comment || ''}
                                  onChange={(e) => updateNestedParams({ comment: e.target.value })}
                                  placeholder="Ótimo post!"
                                  className="text-xs min-h-[60px]"
                                />
                              </div>
                            </div>
                          );
                        
                        default:
                          return (
                            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                              Configuração não disponível para este tipo de ação.
                            </div>
                          );
                      }
                    })()}
                  </CardContent>
                </Card>
              ))}
              
              {(!forEachParams.actions || forEachParams.actions.length === 0) && (
                <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded border-2 border-dashed border-gray-200 text-center">
                  Nenhuma ação configurada. Clique em "Adicionar Ação" para começar.
                </div>
              )}
              
              <div className="text-xs text-gray-600 p-2 bg-blue-50 rounded border border-blue-200">
                💡 Use a variável <code className="bg-blue-100 px-1 rounded">{`{{item}}`}</code> para referenciar o item atual do loop nas ações acima.
              </div>
            </div>
          </div>
        );
      
      case 'likePost':
        const likeParams = action.params as any;
        const isPostVariableValid = isVariableCompatible(likeParams.postId || '', 'post');
        
        return (
          <div>
            <Label className="text-xs flex items-center gap-2">
              URL do Post
              {!isPostVariableValid && (
                <span className="text-red-500 text-xs">⚠️ Variável incompatível</span>
              )}
            </Label>
            <div className="flex gap-1">
              <Input
                value={likeParams.postId || ''}
                onChange={(e) => updateParams({ postId: e.target.value })}
                placeholder="https://instagram.com/p/..."
                className={`h-8 text-xs flex-1 ${!isPostVariableValid ? 'border-red-300' : ''}`}
              />
              <VariablePicker
                workflow={workflow}
                onVariableSelect={(variable) => updateParams({ postId: `{{${variable}}}` })}
                filterVariables={(variables) => variables.filter(v => isVariableCompatible(`{{${v}}}`, 'post'))}
              >
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <Variable className="h-3 w-3" />
                </Button>
              </VariablePicker>
            </div>
            {!isPostVariableValid && (
              <div className="text-xs text-red-600 mt-1">
                Esta variável contém dados de usuários, mas este campo espera URLs de posts.
              </div>
            )}
          </div>
        );
      
      case 'followUser':
      case 'unfollowUser':
        const userParams = action.params as any;
        const isUserVariableValid = isVariableCompatible(userParams.username || '', 'user');
        
        return (
          <div>
            <Label className="text-xs flex items-center gap-2">
              Usuário
              {!isUserVariableValid && (
                <span className="text-red-500 text-xs">⚠️ Variável incompatível</span>
              )}
            </Label>
            <div className="flex gap-1">
              <Input
                value={userParams.username || ''}
                onChange={(e) => updateParams({ username: e.target.value })}
                placeholder="@usuario"
                className={`h-8 text-xs flex-1 ${!isUserVariableValid ? 'border-red-300' : ''}`}
              />
              <VariablePicker
                workflow={workflow}
                onVariableSelect={(variable) => updateParams({ username: `{{${variable}}}` })}
                filterVariables={(variables) => variables.filter(v => isVariableCompatible(`{{${v}}}`, 'user'))}
              >
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <Variable className="h-3 w-3" />
                </Button>
              </VariablePicker>
            </div>
            {!isUserVariableValid && (
              <div className="text-xs text-red-600 mt-1">
                Esta variável contém dados de posts, mas este campo espera nomes de usuários.
              </div>
            )}
          </div>
        );
      
      case 'comment':
        const commentParams = action.params as any;
        const isCommentPostVariableValid = isVariableCompatible(commentParams.postId || '', 'post');
        
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs flex items-center gap-2">
                URL do Post
                {!isCommentPostVariableValid && (
                  <span className="text-red-500 text-xs">⚠️ Variável incompatível</span>
                )}
              </Label>
              <div className="flex gap-1">
                <Input
                  value={commentParams.postId || ''}
                  onChange={(e) => updateParams({ postId: e.target.value })}
                  placeholder="https://instagram.com/p/..."
                  className={`h-8 text-xs flex-1 ${!isCommentPostVariableValid ? 'border-red-300' : ''}`}
                />
                <VariablePicker
                  workflow={workflow}
                  onVariableSelect={(variable) => updateParams({ postId: `{{${variable}}}` })}
                  filterVariables={(variables) => variables.filter(v => isVariableCompatible(`{{${v}}}`, 'post'))}
                >
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <Variable className="h-3 w-3" />
                  </Button>
                </VariablePicker>
              </div>
              {!isCommentPostVariableValid && (
                <div className="text-xs text-red-600 mt-1">
                  Esta variável contém dados de usuários, mas este campo espera URLs de posts.
                </div>
              )}
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
      
      case 'uploadPhoto':
        const uploadParams = action.params as any;
        
        const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          
          // Validar tipo de arquivo
          const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'
          ];
          
          if (!allowedTypes.includes(file.type)) {
            alert('Tipo de arquivo não suportado. Use imagens (JPEG, PNG, GIF, WebP) ou vídeos (MP4, AVI, MOV, WMV, WebM)');
            return;
          }
          
          // Fazer upload do arquivo
          const instanceName = workflow.name || 'default';
          const result = await uploadFile(file, instanceName);
          
          if (result && result.success) {
            // Atualizar parâmetros com o resultado do upload
            updateParams({ 
              imagePath: result.publicUrl
            });
            
            // Atualizar o step no workflow para refletir a mudança no nó
            const updatedStep = {
              ...selectedStep,
              actions: selectedStep.actions.map((act, idx) => 
                idx === index ? { ...act, params: { ...act.params, imagePath: result.publicUrl } } : act
              )
            };
            onStepChange(updatedStep);
          }
        };
        
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Legenda</Label>
              <Textarea
                value={uploadParams.caption || ''}
                onChange={(e) => updateParams({ caption: e.target.value })}
                placeholder="Escreva uma legenda para sua foto ou vídeo..."
                className="h-16 text-xs resize-none"
              />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Arquivo (Foto ou Vídeo)
              </Label>
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="h-8 text-xs pl-8"
                />
                <svg className="absolute left-2 top-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Aceita imagens (JPEG, PNG, GIF, WebP) e vídeos (MP4, AVI, MOV, WMV, WebM)
              </div>
              
              {uploading && (
                <div className="text-xs text-blue-600 mt-1">
                  📤 Fazendo upload do arquivo...
                </div>
              )}
              
              {error && (
                <div className="text-xs text-red-600 mt-1">
                  ❌ Erro: {error}
                  <button 
                    onClick={clearError}
                    className="ml-2 underline hover:no-underline"
                  >
                    Limpar
                  </button>
                </div>
              )}
              
              {uploadParams.imagePath && !uploading && (
                <div className="text-xs text-green-600 mt-1">
                  ✅ Arquivo enviado com sucesso
                </div>
              )}
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
                value={monitorPostsParams.maxExecutions || 1}
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
            <div>
              <Label className="text-xs">Idade Máxima do Post</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={monitorPostsParams.maxPostAge || 24}
                  onChange={(e) => updateParams({ maxPostAge: parseInt(e.target.value) || 24 })}
                  placeholder="24"
                  className="h-8 text-xs flex-1"
                  min="1"
                />
                <Select
                  value={monitorPostsParams.maxPostAgeUnit || 'hours'}
                  onValueChange={(value) => updateParams({ maxPostAgeUnit: value })}
                >
                  <SelectTrigger className="h-8 text-xs w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">min</SelectItem>
                    <SelectItem value="hours">h</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Apenas posts feitos nos últimos {monitorPostsParams.maxPostAge || 24} {monitorPostsParams.maxPostAgeUnit === 'minutes' ? 'minutos' : 'horas'} serão processados
              </p>
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