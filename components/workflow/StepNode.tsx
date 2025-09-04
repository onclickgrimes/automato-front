'use client';

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { WorkflowStep, WorkflowAction } from '@/lib/types/workflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Trash2 } from 'lucide-react';

export interface StepNodeData {
  step: WorkflowStep;
  onStepSelect: (stepId: string) => void;
  onAddAction: (stepId: string) => void;
  onDeleteStep: (stepId: string) => void;
  isSelected: boolean;
}

// Cores para cada tipo de ação
const actionColors: Record<string, string> = {
  sendDirectMessage: 'bg-blue-100 text-blue-800 border-blue-200',
  likePost: 'bg-red-100 text-red-800 border-red-200',
  followUser: 'bg-green-100 text-green-800 border-green-200',
  unfollowUser: 'bg-orange-100 text-orange-800 border-orange-200',
  comment: 'bg-purple-100 text-purple-800 border-purple-200',
  monitorMessages: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  monitorPosts: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delay: 'bg-gray-100 text-gray-800 border-gray-200',
};

// Labels amigáveis para os tipos de ação
const actionLabels: Record<string, string> = {
  sendDirectMessage: 'Enviar DM',
  likePost: 'Curtir Post',
  followUser: 'Seguir Usuário',
  unfollowUser: 'Deixar de Seguir',
  comment: 'Comentar',
  monitorMessages: 'Monitorar Mensagens',
  monitorPosts: 'Monitorar Posts',
  delay: 'Aguardar',
};

export default function StepNode({ data, selected }: NodeProps<StepNodeData>) {
  const { step, onStepSelect, onAddAction, onDeleteStep, isSelected } = data;

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
                {step.actions.map((action: WorkflowAction, index: number) => (
                  <div
                    key={index}
                    className={`px-2 py-1 rounded text-xs border ${
                      actionColors[action.type] || 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    <div className="font-medium">
                      {actionLabels[action.type] || action.type}
                    </div>
                    {action.description && (
                      <div className="text-xs opacity-75 truncate">
                        {action.description}
                      </div>
                    )}
                  </div>
                ))}
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
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 !bg-gray-400 border-2 border-white"
      />
    </div>
  );
}