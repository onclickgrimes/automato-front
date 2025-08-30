-- Criação das tabelas e políticas RLS para o SaaS de Automação de Mídias Sociais

-- 1. Tabela de perfis (profiles)
-- Relacionamento one-to-one com auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de contas sociais (social_accounts)
-- Armazena credenciais e metadados das contas de redes sociais
CREATE TYPE social_account_type AS ENUM ('instagram', 'whatsapp', 'facebook');
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'paused');

CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type social_account_type NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT,
  session_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  status account_status DEFAULT 'active',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type, username)
);

-- 3. Tabela de rotinas (routines)
-- Armazena as rotinas de automação dos usuários
CREATE TYPE trigger_type AS ENUM ('cron', 'manual', 'event');
CREATE TYPE routine_status AS ENUM ('active', 'inactive', 'paused');

CREATE TABLE IF NOT EXISTS public.routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type trigger_type NOT NULL DEFAULT 'manual',
  trigger_config JSONB DEFAULT '{}', -- Para configurações de cron, eventos, etc.
  actions JSONB NOT NULL DEFAULT '[]', -- Array de ações a serem executadas
  is_active BOOLEAN DEFAULT true,
  status routine_status DEFAULT 'active',
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
  proxy_id UUID REFERENCES public.proxies(id) ON DELETE SET NULL,
  last_executed TIMESTAMP WITH TIME ZONE,
  next_execution TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de proxies (proxies)
-- Armazena os proxies dos usuários para automação
CREATE TYPE proxy_status AS ENUM ('active', 'inactive', 'error');

CREATE TABLE IF NOT EXISTS public.proxies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT,
  password TEXT,
  proxy_type TEXT DEFAULT 'http', -- http, https, socks5
  is_active BOOLEAN DEFAULT true,
  status proxy_status DEFAULT 'inactive',
  last_tested TIMESTAMP WITH TIME ZONE,
  response_time INTEGER, -- em ms
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de logs de execução (execution_logs)
-- Para rastrear execuções de rotinas e ações
CREATE TABLE IF NOT EXISTS public.execution_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, success, error
  result JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS (Row Level Security)
-- As políticas RLS específicas serão definidas em supabase_rls_policies.sql

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;

-- TRIGGERS para updated_at

-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proxies_updated_at BEFORE UPDATE ON public.proxies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FUNÇÃO para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ÍNDICES para melhor performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON public.social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_type ON public.social_accounts(type);
CREATE INDEX IF NOT EXISTS idx_social_accounts_status ON public.social_accounts(status);
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_is_active ON public.routines(is_active);
CREATE INDEX IF NOT EXISTS idx_routines_status ON public.routines(status);
CREATE INDEX IF NOT EXISTS idx_routines_social_account_id ON public.routines(social_account_id);
CREATE INDEX IF NOT EXISTS idx_routines_proxy_id ON public.routines(proxy_id);
CREATE INDEX IF NOT EXISTS idx_proxies_user_id ON public.proxies(user_id);
CREATE INDEX IF NOT EXISTS idx_proxies_is_active ON public.proxies(is_active);
CREATE INDEX IF NOT EXISTS idx_proxies_status ON public.proxies(status);
CREATE INDEX IF NOT EXISTS idx_execution_logs_user_id ON public.execution_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_routine_id ON public.execution_logs(routine_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_status ON public.execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_execution_logs_social_account_id ON public.execution_logs(social_account_id);