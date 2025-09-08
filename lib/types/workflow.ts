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
  | 'uploadPhoto'
  | 'startMessageProcessor'
  | 'stopMessageProcessor'
  | 'if'
  | 'forEach';

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
  commentByAI?: boolean;
}

export interface MonitorMessagesParams {
  keywords: string[];
  autoReply?: boolean;
  replyMessage?: string;
}

export interface MonitorPostsParams {
  hashtags: string[];
  usernames?: string[]; // Array de usuários com posts monitorados
  checkInterval?: number; // Intervalo de verificação entre um ciclo e outro
  maxExecutions?: number; // Número de loops que monitorar posts deve fazer
  maxPostsPerUser?: number; // Número de primeiros posts que o loop deve extrair
  maxPostAge?: number; // Idade máxima do post (baseado no campo postDate)
  maxPostAgeUnit?: 'minutes' | 'hours'; // Unidade de tempo para maxPostAge
}

export interface DelayParams {
  duration: number; // em milissegundos
}

export interface UploadPhotoParams {
  caption: string;
  imagePath: string; // URL pública da imagem no Supabase Storage
}

export interface IfParams {
  variable: string; // Variável a ser testada (pode usar template {{}})
  operator: 'equals' | 'notEquals' | 'isEmpty' | 'isNotEmpty' | 'greaterThan' | 'lessThan' | 'contains';
  value?: any; // Valor para comparação (opcional para isEmpty/isNotEmpty)
}

export interface ForEachParams {
  list: string; // Lista para iterar (pode usar template {{}})
  actions: WorkflowAction[]; // Ações a serem executadas para cada item
}

// Interface para uma ação do workflow
export interface WorkflowAction {
  type: WorkflowActionType;
  params: {
    user?: string;
    message?: string;
    postId?: string;
    username?: string;
    comment?: string;
    commentByAI?: boolean;
    duration?: number; // em milissegundos
    caption?: string; // Para uploadPhoto
    imagePath?: string; // Para uploadPhoto - URL pública da imagem
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
    // Parâmetros para ações condicionais
    variable?: string; // Para if
    operator?: 'equals' | 'notEquals' | 'isEmpty' | 'isNotEmpty' | 'greaterThan' | 'lessThan' | 'contains'; // Para if
    value?: any; // Para if
    list?: string; // Para forEach
    actions?: WorkflowAction[]; // Para forEach - ações aninhadas
  };
  description?: string;
}

// Step do workflow
export interface WorkflowStep {
  id: string;
  name: string;
  actions: WorkflowAction[];
  retry?: {
    maxAttempts: number;
    delayMs: number;
  };
  position?: {
    x: number;
    y: number;
  };
}

// Configurações do workflow
export interface WorkflowConfig {
  stopOnError?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  timeout?: number; // timeout global em milissegundos
}

// Interface para representar uma conexão entre steps
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // Para identificar caminhos condicionais (onTrue, onFalse, etc.)
  targetHandle?: string;
  type?: string;
}

// Workflow principal
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  edges?: WorkflowEdge[];
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