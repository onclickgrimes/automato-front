// Tipos TypeScript baseados no schema da tabela instagram_accounts

export type InstagramAuthType = 'credentials' | 'cookie';

export interface InstagramAccount {
  id: string;
  user_id: string;
  username: string;
  auth_type: InstagramAuthType;
  is_logged_in: boolean;
  is_monitoring: boolean;
  working: boolean;
  login_time?: string | null;
  logout_time?: string | null;
  monitor_started_at?: string | null;
  monitor_stopped_at?: string | null;
  monitor_keywords?: string[] | null;
  auto_reply_enabled: boolean;
  auto_reply_message?: string | null;
  profile_data?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// Tipo para criação de nova conta (sem campos auto-gerados)
export interface CreateInstagramAccountData {
  user_id: string;
  username: string;
  auth_type: InstagramAuthType;
  monitor_keywords?: string[] | null;
  auto_reply_enabled?: boolean;
  auto_reply_message?: string | null;
  profile_data?: Record<string, any> | null;
}

// Tipo para atualização de conta (todos os campos opcionais exceto id)
export interface UpdateInstagramAccountData {
  username?: string;
  auth_type?: InstagramAuthType;
  is_logged_in?: boolean;
  is_monitoring?: boolean;
  working?: boolean;
  login_time?: string | null;
  logout_time?: string | null;
  monitor_started_at?: string | null;
  monitor_stopped_at?: string | null;
  monitor_keywords?: string[] | null;
  auto_reply_enabled?: boolean;
  auto_reply_message?: string | null;
  profile_data?: Record<string, any> | null;
}

// Tipo para filtros de busca
export interface InstagramAccountFilters {
  user_id?: string;
  username?: string;
  auth_type?: InstagramAuthType;
  is_logged_in?: boolean;
  is_monitoring?: boolean;
  working?: boolean;
  auto_reply_enabled?: boolean;
}

// Tipo para resposta de operações CRUD
export interface InstagramAccountResponse {
  success: boolean;
  data?: InstagramAccount | InstagramAccount[];
  error?: string;
  count?: number;
}

// Tipo para validação de dados
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}