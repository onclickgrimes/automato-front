// Tipos de ações disponíveis no workflow
export type WorkflowActionType = 
  | 'sendDirectMessage'
  | 'likePost'
  | 'followUser'
  | 'unfollowUser'
  | 'comment'
  | 'monitorMessages'
  | 'monitorPosts'
  | 'delay';

// Parâmetros específicos para cada tipo de ação
export interface SendDirectMessageParams {
  username: string;
  message: string;
}

export interface LikePostParams {
  postUrl: string;
}

export interface FollowUserParams {
  username: string;
}

export interface UnfollowUserParams {
  username: string;
}

export interface CommentParams {
  postUrl: string;
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
  seconds: number;
}

// União de todos os tipos de parâmetros
export type WorkflowActionParams = 
  | SendDirectMessageParams
  | LikePostParams
  | FollowUserParams
  | UnfollowUserParams
  | CommentParams
  | MonitorMessagesParams
  | MonitorPostsParams
  | DelayParams;

// Interface para uma ação do workflow
export interface WorkflowAction {
  type: WorkflowActionType;
  params: WorkflowActionParams;
  description?: string;
}

// Interface para um step do workflow
export interface WorkflowStep {
  id: string;
  name: string;
  actions: WorkflowAction[];
  condition?: string;
  retry?: {
    maxAttempts: number;
    delaySeconds: number;
  };
}

// Configurações do workflow
export interface WorkflowConfig {
  maxConcurrentSteps?: number;
  timeoutSeconds?: number;
  onError?: 'stop' | 'continue' | 'retry';
  notifications?: {
    onSuccess?: boolean;
    onError?: boolean;
    email?: string;
  };
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