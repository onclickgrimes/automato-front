-- Migração para suporte ao Instagram com múltiplas contas
-- Criado em: 2024-01-20

-- Tabela para armazenar contas do Instagram
CREATE TABLE IF NOT EXISTS instagram_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    auth_type VARCHAR(50) NOT NULL CHECK (auth_type IN ('credentials', 'cookies')),
    is_logged_in BOOLEAN DEFAULT FALSE,
    is_monitoring BOOLEAN DEFAULT FALSE,
    login_time TIMESTAMPTZ,
    logout_time TIMESTAMPTZ,
    monitor_started_at TIMESTAMPTZ,
    monitor_stopped_at TIMESTAMPTZ,
    monitor_keywords TEXT[],
    auto_reply_enabled BOOLEAN DEFAULT FALSE,
    auto_reply_message TEXT,
    profile_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, username)
);

-- Tabela para registrar ações do Instagram
CREATE TABLE IF NOT EXISTS instagram_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('like', 'comment', 'follow', 'unfollow', 'upload', 'message')),
    target_url TEXT,
    target_username VARCHAR(255),
    comment_text TEXT,
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para armazenar mensagens monitoradas
CREATE TABLE IF NOT EXISTS instagram_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    sender_username VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL,
    message_id VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    contains_keyword BOOLEAN DEFAULT FALSE,
    matched_keyword VARCHAR(255),
    auto_replied BOOLEAN DEFAULT FALSE,
    reply_message TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    replied_at TIMESTAMPTZ
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_user_id ON instagram_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_username ON instagram_accounts(username);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_is_logged_in ON instagram_accounts(is_logged_in);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_is_monitoring ON instagram_accounts(is_monitoring);

CREATE INDEX IF NOT EXISTS idx_instagram_actions_user_id ON instagram_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_actions_account_id ON instagram_actions(account_id);
CREATE INDEX IF NOT EXISTS idx_instagram_actions_action_type ON instagram_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_instagram_actions_created_at ON instagram_actions(created_at);

CREATE INDEX IF NOT EXISTS idx_instagram_messages_user_id ON instagram_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_account_id ON instagram_messages(account_id);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_is_read ON instagram_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_contains_keyword ON instagram_messages(contains_keyword);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_received_at ON instagram_messages(received_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela instagram_accounts
CREATE TRIGGER update_instagram_accounts_updated_at
    BEFORE UPDATE ON instagram_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_messages ENABLE ROW LEVEL SECURITY;

-- Política para instagram_accounts: usuários só podem ver suas próprias contas
CREATE POLICY "Users can view own instagram accounts" ON instagram_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own instagram accounts" ON instagram_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own instagram accounts" ON instagram_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own instagram accounts" ON instagram_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Política para instagram_actions: usuários só podem ver suas próprias ações
CREATE POLICY "Users can view own instagram actions" ON instagram_actions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own instagram actions" ON instagram_actions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para instagram_messages: usuários só podem ver suas próprias mensagens
CREATE POLICY "Users can view own instagram messages" ON instagram_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own instagram messages" ON instagram_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own instagram messages" ON instagram_messages
    FOR UPDATE USING (auth.uid() = user_id);