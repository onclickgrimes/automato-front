'use client';

import React, { useState } from 'react';
import { WorkflowStep, WorkflowActionType } from '@/lib/types/workflow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Variable, Database } from 'lucide-react';
import { getActionConfig } from '@/lib/config/workflow-actions';

interface VariablePickerProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  steps?: WorkflowStep[];
  workflow?: any;
  onVariableSelect: (variable: string) => void;
  filterVariables?: (variables: string[]) => string[];
  children?: React.ReactNode;
}

// Mapeamento estático das saídas conhecidas de cada tipo de ação
const actionOutputs: Record<WorkflowActionType, any> = {
  monitorPosts: {
    result: {
      allLikers: [],
      posts: [
        {
          id: 'post_123456789',
          url: 'https://instagram.com/p/example',
          caption: 'Exemplo de legenda do post',
          likes: 150,
          comments: 25,
          author: 'usuario_exemplo',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ],
      executionCount: 0,
      lastPostId: '',
      totalLikes: 0
    }
  },
  followUser: {
    result: {
      success: true,
      username: 'exemplo',
      followedAt: '2024-01-01T00:00:00Z'
    }
  },
  unfollowUser: {
    result: {
      success: true,
      username: 'exemplo',
      unfollowedAt: '2024-01-01T00:00:00Z'
    }
  },
  likePost: {
    result: {
      success: true,
      postUrl: 'https://instagram.com/p/example',
      likedAt: '2024-01-01T00:00:00Z'
    }
  },
  comment: {
    result: {
      success: true,
      commentText: 'Comentário exemplo',
      postUrl: 'https://instagram.com/p/example',
      commentedAt: '2024-01-01T00:00:00Z'
    }
  },
  sendDirectMessage: {
    result: {
      success: true,
      recipient: 'usuario_exemplo',
      messageText: 'Mensagem exemplo',
      sentAt: '2024-01-01T00:00:00Z'
    }
  },
  monitorMessages: {
    result: {
      newMessages: [],
      totalMessages: 0,
      lastMessageId: '',
      executionCount: 0
    }
  },
  uploadPhoto: {
    result: {
      success: true,
      postUrl: 'https://instagram.com/p/example',
      caption: 'Legenda da foto',
      uploadedAt: '2024-01-01T00:00:00Z'
    }
  },
  delay: {
    result: {
      success: true,
      delayDuration: 5000,
      completedAt: '2024-01-01T00:00:00Z'
    }
  },
  startMessageProcessor: {
    result: {
      success: true,
      processorId: 'proc_123',
      startedAt: '2024-01-01T00:00:00Z'
    }
  },
  stopMessageProcessor: {
    result: {
      success: true,
      processorId: 'proc_123',
      stoppedAt: '2024-01-01T00:00:00Z'
    }
  },
  if: {
    result: {
      conditionMet: true,
      evaluatedAt: '2024-01-01T00:00:00Z'
    }
  },
  forEach: {
    result: {
      itemsProcessed: 0,
      currentItem: null,
      completedAt: '2024-01-01T00:00:00Z'
    }
  }
};

// Função para renderizar uma árvore de objetos de forma recursiva
function renderObjectTree(
  obj: any,
  path: string,
  onSelect: (path: string) => void,
  expandedPaths: Set<string>,
  toggleExpanded: (path: string) => void,
  level: number = 0
): React.ReactNode {
  if (obj === null || obj === undefined) {
    return (
      <div 
        className={`flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded ml-${level * 4}`}
        onClick={() => onSelect(path)}
      >
        <Variable className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">null</span>
      </div>
    );
  }

  if (typeof obj !== 'object' || Array.isArray(obj)) {
    const displayValue = Array.isArray(obj) ? `Array[${obj.length}]` : String(obj);
    return (
      <div 
        className={`flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded ml-${level * 4}`}
        onClick={() => onSelect(path)}
      >
        <Variable className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-mono">{displayValue}</span>
      </div>
    );
  }

  return (
    <div className={`ml-${level * 4}`}>
      {Object.entries(obj).map(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        const isExpanded = expandedPaths.has(currentPath);
        const hasChildren = value && typeof value === 'object' && !Array.isArray(value);

        return (
          <div key={currentPath}>
            <div 
              className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded"
              onClick={() => {
                if (hasChildren) {
                  toggleExpanded(currentPath);
                } else {
                  onSelect(currentPath);
                }
              }}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )
              ) : (
                <Variable className="w-4 h-4 text-blue-500" />
              )}
              <span className="text-sm font-medium">{key}</span>
              {!hasChildren && (
                <span className="text-xs text-gray-500 ml-auto">
                  {Array.isArray(value) ? `Array[${value.length}]` : typeof value}
                </span>
              )}
            </div>
            {hasChildren && isExpanded && (
              <div className="ml-4">
                {renderObjectTree(value, currentPath, onSelect, expandedPaths, toggleExpanded, level + 1)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function VariablePicker({ 
  isOpen, 
  setIsOpen, 
  steps, 
  workflow, 
  onVariableSelect, 
  filterVariables,
  children 
}: VariablePickerProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Se usado como botão (com children), gerencia seu próprio estado
  const modalIsOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const setModalIsOpen = setIsOpen || setInternalIsOpen;
  
  // Determina os steps a usar (de workflow.steps ou steps direto)
  const workflowSteps = steps || (workflow?.steps || []);

  const toggleStepExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const togglePathExpanded = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const handleVariableSelect = (stepId: string, path: string) => {
    const fullPath = `{{steps.${stepId}.${path}}}`;
    onVariableSelect(fullPath);
    setIsOpen(false);
  };

  // Se children são fornecidos, renderiza como botão
  if (children) {
    return (
      <>
        <div onClick={() => setModalIsOpen(true)}>
          {children}
        </div>
        <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Seletor de Variáveis
              </DialogTitle>
              <DialogDescription>
                Selecione uma variável dos steps anteriores.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto">
              {!workflowSteps || workflowSteps.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum step anterior disponível</p>
                  <p className="text-sm">Adicione steps antes desta condição para usar suas variáveis.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Implementar lista simplificada de variáveis aqui */}
                  <p className="text-sm text-gray-600">Funcionalidade em desenvolvimento...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  // Renderização original como modal
  return (
    <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Seletor de Variáveis
          </DialogTitle>
          <DialogDescription>
            Selecione uma variável dos steps anteriores para usar na condição.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {!workflowSteps || workflowSteps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum step anterior disponível</p>
              <p className="text-sm">Adicione steps antes desta condição para usar suas variáveis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflowSteps.map((step) => {
                const isExpanded = expandedSteps.has(step.id);
                const actionConfig = getActionConfig(step.actions[0]?.type);
                const outputs = step.actions[0] ? actionOutputs[step.actions[0].type] : {};
                
                return (
                  <Card key={step.id} className="border">
                    <CardHeader 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleStepExpanded(step.id)}
                    >
                      <CardTitle className="flex items-center gap-3 text-base">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <div className="flex items-center gap-2">
                          {React.createElement(actionConfig.icon, { className: "w-4 h-4" })}
                          <span>{step.name}</span>
                        </div>
                        <Badge variant="secondary" className="ml-auto">
                          {actionConfig.label}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="pt-0">
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium mb-3 text-gray-700">Variáveis Disponíveis:</h4>
                          {Object.keys(outputs).length === 0 ? (
                            <p className="text-sm text-gray-500 italic">
                              Esta ação não possui saídas de dados definidas.
                            </p>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-3">
                              {renderObjectTree(
                                outputs,
                                '',
                                (path) => handleVariableSelect(step.id, path),
                                expandedPaths,
                                togglePathExpanded
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}