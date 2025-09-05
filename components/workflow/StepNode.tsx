'use client';

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { WorkflowStep, WorkflowAction } from '@/lib/types/workflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Trash2, Copy } from 'lucide-react';
import { getActionColors, getActionLabels } from '@/lib/config/workflow-actions';

export interface StepNodeData {
  step: WorkflowStep;
  onStepSelect: (stepId: string) => void;
  onAddAction: (stepId: string) => void;
  onDeleteStep: (stepId: string) => void;
  onCopyStep?: (stepId: string) => void;
  isSelected: boolean;
  isConnected: boolean;
}

// Usar configuração centralizada
const actionColors = getActionColors();
const actionLabels = getActionLabels();

export default function StepNode({ data, selected }: NodeProps<StepNodeData>) {
  const { step, onStepSelect, onAddAction, onDeleteStep, onCopyStep, isSelected } = data;

  const handleStepClick = () => {
    onStepSelect(step.id);
  };

  const handleAddAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddAction(step.id);
  };

  const handleDeleteStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteStep(step.id);
  };

  const handleCopyStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopyStep) {
      onCopyStep(step.id);
    }
  };

  return (
    <div className="min-w-[280px] max-w-[320px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-4 h-4 !bg-gray-400 border-2 border-white"
      />
      
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isSelected || selected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md'
        }`}
        onClick={handleStepClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800 truncate">
              {step.name}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                onClick={handleCopyStep}
                title="Copiar nó"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                onClick={handleDeleteStep}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {step.condition && (
            <Badge variant="outline" className="text-xs w-fit">
              Condição: {step.condition}
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">
                Ações ({step.actions.length})
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleAddAction}
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            </div>
            
            {step.actions.length === 0 ? (
              <div className="text-xs text-gray-400 italic py-2 text-center border-2 border-dashed border-gray-200 rounded">
                Nenhuma ação configurada
              </div>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {step.actions.map((action: WorkflowAction, index: number) => {
                  // Renderização especial para uploadPhoto
                  if (action.type === 'uploadPhoto' && action.params.imagePath) {
                    return (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-pink-50 rounded border border-pink-200">
                        <img 
                          src={action.params.imagePath} 
                          alt="Thumbnail" 
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-pink-800 truncate">
                            {actionLabels[action.type] || action.type}
                          </div>
                          {action.params.caption && (
                            <div className="text-xs text-pink-600 truncate">
                              {action.params.caption}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  // Renderização especial para if
                  if (action.type === 'if') {
                    return (
                      <div key={index} className={`px-2 py-1 rounded text-xs border ${
                        actionColors[action.type] || 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        <div className="font-medium">{actionLabels[action.type] || action.type}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {action.params.variable} {action.params.operator} {action.params.value || ''}
                        </div>
                      </div>
                    );
                  }
                  
                  // Renderização especial para forEach
                  if (action.type === 'forEach') {
                    const nestedActions = action.params.actions || [];
                    return (
                      <div key={index} className={`px-2 py-1 rounded text-xs border ${
                        actionColors[action.type] || 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        <div className="font-medium">{actionLabels[action.type] || action.type}</div>
                        <div className="text-xs opacity-75 mt-1">
                          Lista: {action.params.list}
                        </div>
                        {nestedActions.length > 0 && (
                          <div className="mt-1 pl-2 border-l-2 border-violet-300">
                            <div className="text-xs text-violet-600 font-medium">Ações:</div>
                            {nestedActions.slice(0, 2).map((nestedAction, nestedIndex) => (
                              <div key={nestedIndex} className="text-xs text-violet-600 truncate">
                                • {actionLabels[nestedAction.type] || nestedAction.type}
                              </div>
                            ))}
                            {nestedActions.length > 2 && (
                              <div className="text-xs text-violet-500">+{nestedActions.length - 2} mais...</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  // Renderização padrão para outras ações
                  return (
                    <div key={index} className={`px-2 py-1 rounded text-xs border ${
                      actionColors[action.type] || 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      <div className="font-medium">{actionLabels[action.type] || action.type}</div>
                      {action.description && (
                        <div className="text-xs opacity-75 mt-1">{action.description}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {step.retry && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <Badge variant="secondary" className="text-xs">
                Retry: {step.retry.maxAttempts}x
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Handles de saída */}
      {step.actions.some(action => action.type === 'if') ? (
        // Múltiplos handles para nós condicionais
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="onTrue"
            style={{ left: '30%' }}
            className="w-3 h-3 bg-green-500 border-2 border-white"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="onFalse"
            style={{ left: '70%' }}
            className="w-3 h-3 bg-red-500 border-2 border-white"
          />
          {/* Labels para os handles */}
          <div className="absolute -bottom-6 left-[25%] text-xs text-green-600 font-medium">
            Sim
          </div>
          <div className="absolute -bottom-6 left-[65%] text-xs text-red-600 font-medium">
            Não
          </div>
        </>
      ) : (
        // Handle padrão para outros nós
        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          className="w-4 h-4 !bg-gray-400 border-2 border-white"
        />
      )}
    </div>
  );
}