-- Criação da tabela workflows para armazenar os workflows do editor visual
-- Execute este SQL no Supabase SQL Editor

-- Criar a tabela workflows
CREATE TABLE IF NOT EXISTS public.workflows (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS workflows_user_id_idx ON public.workflows(user_id);
CREATE INDEX IF NOT EXISTS workflows_created_at_idx ON public.workflows(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios workflows
CREATE POLICY "Users can view own workflows" ON public.workflows
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios workflows
CREATE POLICY "Users can insert own workflows" ON public.workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios workflows
CREATE POLICY "Users can update own workflows" ON public.workflows
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários deletem seus próprios workflows
CREATE POLICY "Users can delete own workflows" ON public.workflows
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.workflows IS 'Tabela para armazenar workflows criados no editor visual';
COMMENT ON COLUMN public.workflows.id IS 'ID único do workflow (definido pelo usuário)';
COMMENT ON COLUMN public.workflows.user_id IS 'ID do usuário proprietário do workflow';
COMMENT ON COLUMN public.workflows.workflow IS 'Dados completos do workflow em formato JSON';
COMMENT ON COLUMN public.workflows.created_at IS 'Data de criação do workflow';
COMMENT ON COLUMN public.workflows.updated_at IS 'Data da última atualização do workflow';