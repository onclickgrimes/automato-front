-- Migration: Create instagram_posts table
-- Description: Tabela para armazenar posts do Instagram coletados pelo backend
-- Date: 2025-01-02

CREATE TABLE public.instagram_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  post_id text NOT NULL,
  username text NOT NULL,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  post_date timestamp with time zone,
  liked_by_users jsonb DEFAULT '[]'::jsonb,
  followed_likers boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT instagram_posts_pkey PRIMARY KEY (id),
  CONSTRAINT instagram_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT instagram_posts_post_id_unique UNIQUE (post_id, user_id)
);

-- Comentários nas colunas
COMMENT ON COLUMN public.instagram_posts.liked_by_users IS 'Array de usernames que curtiram o post';
COMMENT ON COLUMN public.instagram_posts.followed_likers IS 'Se já seguiu os curtidores deste post';
COMMENT ON COLUMN public.instagram_posts.post_id IS 'ID único do post extraído da URL';
COMMENT ON COLUMN public.instagram_posts.url IS 'URL completa do post no Instagram';

-- Índices para melhor performance
CREATE INDEX idx_instagram_posts_user_id ON public.instagram_posts(user_id);
CREATE INDEX idx_instagram_posts_username ON public.instagram_posts(username);
CREATE INDEX idx_instagram_posts_post_date ON public.instagram_posts(post_date);
CREATE INDEX idx_instagram_posts_followed_likers ON public.instagram_posts(followed_likers);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

-- Política RLS: Usuários só podem acessar seus próprios posts
CREATE POLICY "Users can view own instagram posts" ON public.instagram_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own instagram posts" ON public.instagram_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own instagram posts" ON public.instagram_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own instagram posts" ON public.instagram_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_instagram_posts_updated_at
    BEFORE UPDATE ON public.instagram_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();