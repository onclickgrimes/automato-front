// Tipos para requisições da API do Instagram

// Requisições de Automação
export interface InstagramLoginRequest {
  username: string;
  password: string;
}

export interface InstagramLikeRequest {
  postId: string;
}

export interface InstagramCommentRequest {
  postId: string;
  comment: string;
}

export interface InstagramMessageRequest {
  userId: string;
  message: string;
}

export interface InstagramPhotoRequest {
  imagePath: string;
  caption?: string;
}

export interface InstagramFollowRequest {
  userId: string;
}

export interface InstagramUnfollowRequest {
  userId: string;
}

// Requisições de Monitoramento
export interface InstagramMonitorStartRequest {
  checkInterval?: number;
  includeRequests?: boolean;
}

// Respostas da API
export interface InstagramApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface InstagramStatusResponse {
  loggedIn: boolean;
  isMonitoring: boolean;
}

// Estados do Instagram
export interface InstagramState {
  isLoggedIn: boolean;
  isMonitoring: boolean;
  isLoading: boolean;
  error: string | null;
}

// Tipos para ações
export type InstagramAction = 
  | 'login'
  | 'like'
  | 'comment'
  | 'message'
  | 'photo'
  | 'follow'
  | 'unfollow'
  | 'monitor_start'
  | 'monitor_stop'
  | 'close';

// Configurações do Instagram
export interface InstagramConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

// Dados de uma conta do Instagram
export interface InstagramAccount {
  id: string;
  username: string;
  isActive: boolean;
  lastLogin?: Date;
  isMonitoring: boolean;
}

// Estatísticas de automação
export interface InstagramStats {
  totalLikes: number;
  totalComments: number;
  totalMessages: number;
  totalPosts: number;
  totalFollows: number;
  totalUnfollows: number;
  lastActivity?: Date;
}

// Logs de atividade
export interface InstagramActivityLog {
  id: string;
  action: InstagramAction;
  timestamp: Date;
  success: boolean;
  details?: string;
  error?: string;
}

// Configurações de monitoramento
export interface InstagramMonitorConfig {
  enabled: boolean;
  checkInterval: number;
  includeRequests: boolean;
  autoReply?: boolean;
  replyMessage?: string;
}

// Dados de uma mensagem do Instagram
export interface InstagramMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isRequest: boolean;
}

// Dados de um post do Instagram
export interface InstagramPost {
  id: string;
  url: string;
  caption?: string;
  likes: number;
  comments: number;
  timestamp: Date;
}

// Dados de um usuário do Instagram
export interface InstagramUser {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  followers: number;
  following: number;
  posts: number;
  isPrivate: boolean;
  isFollowing: boolean;
}

// Resultado de uma operação
export interface InstagramOperationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp: Date;
}

// Configurações de automação
export interface InstagramAutomationConfig {
  enabled: boolean;
  maxLikesPerHour: number;
  maxCommentsPerHour: number;
  maxFollowsPerHour: number;
  maxMessagesPerHour: number;
  workingHours: {
    start: string;
    end: string;
  };
  targetHashtags: string[];
  targetUsers: string[];
  blacklistedUsers: string[];
}

// Hook de estado do Instagram
export interface UseInstagramReturn {
  state: InstagramState;
  login: (credentials: InstagramLoginRequest) => Promise<InstagramOperationResult>;
  logout: () => Promise<InstagramOperationResult>;
  likePost: (request: InstagramLikeRequest) => Promise<InstagramOperationResult>;
  commentPost: (request: InstagramCommentRequest) => Promise<InstagramOperationResult>;
  sendMessage: (request: InstagramMessageRequest) => Promise<InstagramOperationResult>;
  postPhoto: (request: InstagramPhotoRequest) => Promise<InstagramOperationResult>;
  followUser: (request: InstagramFollowRequest) => Promise<InstagramOperationResult>;
  unfollowUser: (request: InstagramUnfollowRequest) => Promise<InstagramOperationResult>;
  startMonitoring: (config?: InstagramMonitorStartRequest) => Promise<InstagramOperationResult>;
  stopMonitoring: () => Promise<InstagramOperationResult>;
  getStatus: () => Promise<InstagramStatusResponse>;
  refreshStatus: () => Promise<void>;
}