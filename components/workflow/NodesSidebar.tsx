'use client';

import React from 'react';
import { WorkflowActionType } from '@/lib/types/workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Heart, 
  UserPlus, 
  UserMinus, 
  MessageSquare, 
  Eye, 
  Search, 
  Clock,
  Plus
} from 'lucide-react';

interface NodesSidebarProps {
  onAddStep: () => void;
}

// Configuração dos tipos de ação com ícones e cores
const actionConfig = {
  sendDirectMessage: {
    label: 'Enviar DM',
    icon: MessageCircle,
    color: 'bg-blue-500',
    description: 'Enviar mensagem direta para um usuário'
  },
  likePost: {
    label: 'Curtir Post',
    icon: Heart,
    color: 'bg-red-500',
    description: 'Curtir um post específico'
  },
  followUser: {
    label: 'Seguir',
    icon: UserPlus,
    color: 'bg-green-500',
    description: 'Seguir um usuário'
  },
  unfollowUser: {
    label: 'Deixar de Seguir',
    icon: UserMinus,
    color: 'bg-orange-500',
    description: 'Deixar de seguir um usuário'
  },
  comment: {
    label: 'Comentar',
    icon: MessageSquare,
    color: 'bg-purple-500',
    description: 'Comentar em um post'
  },
  monitorMessages: {
    label: 'Monitorar Mensagens',
    icon: Eye,
    color: 'bg-yellow-500',
    description: 'Monitorar mensagens recebidas'
  },
  monitorPosts: {
    label: 'Monitorar Posts',
    icon: Search,
    color: 'bg-indigo-500',
    description: 'Monitorar posts por hashtags'
  },
  delay: {
    label: 'Aguardar',
    icon: Clock,
    color: 'bg-gray-500',
    description: 'Aguardar um tempo específico'
  }
};

export default function NodesSidebar({ onAddStep }: NodesSidebarProps) {
  const onDragStart = (event: React.DragEvent, actionType: WorkflowActionType) => {
    event.dataTransfer.setData('application/reactflow', actionType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Seção de ações disponíveis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Ações Disponíveis
            </CardTitle>
            <p className="text-xs text-gray-600">
              Arraste para dentro de um Step
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(actionConfig).map(([actionType, config]) => {
                const IconComponent = config.icon;
                return (
                  <div
                    key={actionType}
                    className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-all duration-200 hover:border-gray-300"
                    draggable
                    onDragStart={(e) => onDragStart(e, actionType as WorkflowActionType)}
                  >
                    <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {config.label}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {config.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Seção de informações */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Como usar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs px-1 py-0 h-5">1</Badge>
                <span>Clique em "Novo Step" para adicionar um step</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs px-1 py-0 h-5">2</Badge>
                <span>Arraste ações para dentro dos steps</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs px-1 py-0 h-5">3</Badge>
                <span>Conecte os steps arrastando das bolinhas</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs px-1 py-0 h-5">4</Badge>
                <span>Clique nos steps para configurar</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}