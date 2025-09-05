import {
  MessageCircle,
  Heart,
  UserPlus,
  UserMinus,
  MessageSquare,
  Eye,
  Search,
  Clock,
  Camera,
  GitBranch,
  RotateCcw,
  Play,
  Square
} from 'lucide-react';
import { WorkflowActionType } from '@/lib/types/workflow';

export interface ActionConfig {
  label: string;
  icon: any;
  color: string;
  badgeColor: string;
  description: string;
}

// Configuração centralizada dos tipos de ação com ícones, cores e labels
export const actionConfig: Record<WorkflowActionType, ActionConfig> = {
  sendDirectMessage: {
    label: 'Enviar DM',
    icon: MessageCircle,
    color: 'bg-blue-500',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Enviar mensagem direta para um usuário'
  },
  likePost: {
    label: 'Curtir Post',
    icon: Heart,
    color: 'bg-red-500',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    description: 'Curtir um post específico'
  },
  followUser: {
    label: 'Seguir',
    icon: UserPlus,
    color: 'bg-green-500',
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
    description: 'Seguir um usuário'
  },
  unfollowUser: {
    label: 'Deixar de Seguir',
    icon: UserMinus,
    color: 'bg-orange-500',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Deixar de seguir um usuário'
  },
  comment: {
    label: 'Comentar',
    icon: MessageSquare,
    color: 'bg-purple-500',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Comentar em um post'
  },
  monitorMessages: {
    label: 'Monitorar Mensagens',
    icon: Eye,
    color: 'bg-yellow-500',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Monitorar mensagens recebidas'
  },
  monitorPosts: {
    label: 'Monitorar Posts',
    icon: Search,
    color: 'bg-indigo-500',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Monitorar posts por hashtags'
  },
  delay: {
    label: 'Aguardar',
    icon: Clock,
    color: 'bg-gray-500',
    badgeColor: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Aguardar um tempo específico'
  },
  uploadPhoto: {
    label: 'Postar Foto',
    icon: Camera,
    color: 'bg-pink-500',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
    description: 'Fazer upload e postar uma foto com legenda'
  },
  startMessageProcessor: {
    label: 'Iniciar Processador',
    icon: Play,
    color: 'bg-emerald-500',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Iniciar processamento automático de mensagens'
  },
  stopMessageProcessor: {
    label: 'Parar Processador',
    icon: Square,
    color: 'bg-red-600',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    description: 'Parar processamento automático de mensagens'
  },
  if: {
    label: 'Condição (Se)',
    icon: GitBranch,
    color: 'bg-cyan-500',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Executar ações baseadas em uma condição'
  },
  forEach: {
    label: 'Para Cada (Loop)',
    icon: RotateCcw,
    color: 'bg-violet-500',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
    description: 'Repetir ações para cada item de uma lista'
  }
};

// Função utilitária para obter configuração de uma ação
export const getActionConfig = (actionType: WorkflowActionType): ActionConfig => {
  return actionConfig[actionType] || {
    label: actionType,
    icon: MessageSquare,
    color: 'bg-gray-500',
    badgeColor: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Ação personalizada'
  };
};

// Função utilitária para obter apenas as cores dos badges
export const getActionColors = (): Record<string, string> => {
  const colors: Record<string, string> = {};
  Object.entries(actionConfig).forEach(([key, config]) => {
    colors[key] = config.badgeColor;
  });
  return colors;
};

// Função utilitária para obter apenas os labels
export const getActionLabels = (): Record<string, string> => {
  const labels: Record<string, string> = {};
  Object.entries(actionConfig).forEach(([key, config]) => {
    labels[key] = config.label;
  });
  return labels;
};