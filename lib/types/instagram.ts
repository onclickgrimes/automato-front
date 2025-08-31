// Tipos para requisições da API do Instagram

// Tipos de autenticação
export type InstagramAuthType = 'credentials' | 'cookie';

export interface InstagramCredentialsAuth {
  type: 'credentials';
  username: string;
  password: string;
}

export interface InstagramCookieAuth {
  type: 'cookie';
  sessionId: string;
  csrfToken?: string;
  userId?: string;
}

export type InstagramAuthData = InstagramCredentialsAuth | InstagramCookieAuth;

// Requisições de Automação
export interface InstagramLoginRequest {
  accountId?: string; // ID da conta para múltiplas contas
  auth: InstagramAuthData;
}

export interface InstagramLikeRequest {
  accountId?: string;
  postId: string;
}

export interface InstagramCommentRequest {
  accountId?: string;
  postId: string;
  comment: string;
}

export interface InstagramMessageRequest {
  accountId?: string;
  userId: string;
  message: string;
}

export interface InstagramPhotoRequest {
  accountId?: string;
  imagePath: string;
  caption?: string;
}

export interface InstagramFollowRequest {
  accountId?: string;
  userId: string;
}

export interface InstagramUnfollowRequest {
  accountId?: string;
  userId: string;
}

// Requisições de Monitoramento
export interface InstagramMonitorStartRequest {
  accountId?: string;
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
  accounts: InstagramAccountState[];
  activeAccountId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface InstagramAccountState {
  id: string;
  username: string;
  isLoggedIn: boolean;
  isMonitoring: boolean;
  authType: InstagramAuthType;
  lastActivity?: Date;
  stats: InstagramStats;
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
  displayName?: string;
  profilePicture?: string;
  authType: InstagramAuthType;
  isActive: boolean;
  lastLogin?: Date;
  isMonitoring: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  // Gerenciamento de contas
  addAccount: (credentials: InstagramLoginRequest) => Promise<InstagramOperationResult>;
  removeAccount: (accountId: string) => Promise<InstagramOperationResult>;
  switchAccount: (accountId: string) => void;
  getActiveAccount: () => InstagramAccountState | null;
  // Autenticação
  login: (credentials: InstagramLoginRequest) => Promise<InstagramOperationResult>;
  logout: (accountId?: string) => Promise<InstagramOperationResult>;
  // Ações do Instagram
  likePost: (request: InstagramLikeRequest) => Promise<InstagramOperationResult>;
  commentPost: (request: InstagramCommentRequest) => Promise<InstagramOperationResult>;
  sendMessage: (request: InstagramMessageRequest) => Promise<InstagramOperationResult>;
  postPhoto: (request: InstagramPhotoRequest) => Promise<InstagramOperationResult>;
  followUser: (request: InstagramFollowRequest) => Promise<InstagramOperationResult>;
  unfollowUser: (request: InstagramUnfollowRequest) => Promise<InstagramOperationResult>;
  // Monitoramento
  startMonitoring: (config?: InstagramMonitorStartRequest) => Promise<InstagramOperationResult>;
  stopMonitoring: (accountId?: string) => Promise<InstagramOperationResult>;
  // Status
  getStatus: (accountId?: string) => Promise<InstagramStatusResponse>;
  refreshStatus: (accountId?: string) => Promise<void>;
}