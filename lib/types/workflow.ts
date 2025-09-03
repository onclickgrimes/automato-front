// Tipos de ações disponíveis no workflow
export type WorkflowActionType = 
  | 'sendDirectMessage'
  | 'likePost'
  | 'followUser'
  | 'unfollowUser'
  | 'monitorMessages'
  | 'monitorPosts'
  | 'comment'
  | 'delay'
  | 'startMessageProcessor'
  | 'stopMessageProcessor';

// Interfaces mantidas para compatibilidade com código existente
export interface SendDirectMessageParams {
  user: string;
  message: string;
}

export interface LikePostParams {
  postId: string;
}

export interface FollowUserParams {
  username: string;
}

export interface UnfollowUserParams {
  username: string;
}

export interface CommentParams {
  postId: string;
  comment: string;
}

export interface MonitorMessagesParams {
  keywords: string[];
  autoReply?: boolean;
  replyMessage?: string;
}

export interface MonitorPostsParams {
  hashtags: string[];
  usernames?: string[];
  maxPosts?: number;
}

export interface DelayParams {
  duration: number; // em milissegundos
}

// Interface para uma ação do workflow
export interface WorkflowAction {
  type: WorkflowActionType;
  params: {
    user?: string;
    message?: string;
    postId?: string;
    postId?: string;
    username?: string;
    comment?: string;
    duration?: number; // em milissegundos
    includeRequests?: boolean;
    checkInterval?: number;
    maxExecutions?: number;
    maxPostsPerUser?: number;
    onNewMessage?: (data: any) => void;
    onNewPost?: (data: any) => void;
    // Parâmetros para MessageProcessor
    aiConfig?: {
      openaiApiKey?: string;
      googleApiKey?: string;
      temperature?: number;
      maxTokens?: number;
    };
    processingConfig?: {
      checkInterval?: number;
      maxMessagesPerBatch?: number;
      delayBetweenReplies?: { min: number; max: number };
      enableHumanization?: boolean;
    };
  };
  description?: string;
}

// Interface para um step do workflow
export interface WorkflowStep {
  id: string;
  name: string;
  actions: WorkflowAction[];
  condition?: {
    type: 'success' | 'failure' | 'always';
    previousStep?: string;
  };
  retry?: {
    maxAttempts: number;
    delayMs: number;
  };
}

// Configurações do workflow
export interface WorkflowConfig {
  stopOnError?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  timeout?: number; // timeout global em milissegundos
}

// Interface principal do workflow
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  username: string;
  steps: WorkflowStep[];
  config?: WorkflowConfig;
}

// Tipos para o editor visual
export interface WorkflowNodeData {
  step: WorkflowStep;
  isSelected?: boolean;
}

export interface WorkflowEditorState {
  workflow: Workflow;
  selectedStepId?: string;
  selectedActionIndex?: number;
}

// Tipos para drag and drop
export interface DragItem {
  type: 'step' | 'action';
  actionType?: WorkflowActionType;
}

// Tipos para o painel lateral
export interface SidebarProps {
  workflow: Workflow;
  selectedStep?: WorkflowStep;
  onWorkflowChange: (workflow: Workflow) => void;
  onStepChange: (step: WorkflowStep) => void;
}

// Tipos para validação
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Tipos para persistência no Supabase
export interface WorkflowRecord {
  id: string;
  user_id: string;
  workflow: Workflow;
  created_at?: string;
  updated_at?: string;
}