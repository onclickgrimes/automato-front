// Tipos para posts do Instagram

export interface InstagramPost {
  id?: string;
  user_id?: string;
  url: string;
  post_id: string;
  username: string;
  caption?: string | null;
  likes: number;
  comments: number;
  post_date?: string | null;
  liked_by_users: string[];
  followed_likers: boolean;
  created_at?: string;
  updated_at?: string;
}

// Tipo para o post recebido do backend
export interface InstagramPostFromBackend {
  url: string;
  post_id?: string;
  username: string;
  likes?: number;
  comments?: number;
  post_date?: string;
  date?: string; // Campo alternativo para data
  liked_by_users?: string[];
  caption?: string;
  followedLikers?: boolean;
}

// Payload completo recebido do backend
export interface InstagramPostsPayload {
  username: string;
  posts: InstagramPostFromBackend[];
}

// Dados para criar um novo post
export interface CreateInstagramPostData {
  user_id: string;
  url: string;
  post_id: string;
  username: string;
  caption?: string;
  likes?: number;
  comments?: number;
  post_date?: string | null;
  liked_by_users?: string[];
  followed_likers?: boolean;
}

// Dados para atualizar um post
export interface UpdateInstagramPostData {
  url?: string;
  caption?: string;
  likes?: number;
  comments?: number;
  post_date?: string | null;
  liked_by_users?: string[];
  followed_likers?: boolean;
}

// Filtros para buscar posts
export interface InstagramPostFilters {
  username?: string;
  followed_likers?: boolean;
  post_date_from?: string;
  post_date_to?: string;
  min_likes?: number;
  max_likes?: number;
  min_comments?: number;
  max_comments?: number;
}

// Resposta padrão das operações
export interface InstagramPostResponse {
  success: boolean;
  data?: InstagramPost | InstagramPost[];
  error?: string;
  count?: number;
  message?: string;
}

// Estatísticas dos posts
export interface InstagramPostStats {
  total_posts: number;
  total_likes: number;
  total_comments: number;
  posts_with_followed_likers: number;
  average_likes: number;
  average_comments: number;
}

// Resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}