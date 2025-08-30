-- =====================================================
-- POLÍTICAS RLS AVANÇADAS PARA AUTOMATO
-- =====================================================
-- Este arquivo contém políticas RLS mais específicas e otimizadas
-- para garantir máxima segurança dos dados dos usuários

-- =====================================================
-- PROFILES - Políticas Avançadas
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Política para SELECT - usuários podem ver apenas seu próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Política para INSERT - apenas durante criação automática via trigger
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Política para UPDATE - usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política para DELETE - usuários podem deletar apenas seu próprio perfil
CREATE POLICY "profiles_delete_own" ON public.profiles
    FOR DELETE
    USING (auth.uid() = id);

-- =====================================================
-- SOCIAL_ACCOUNTS - Políticas Avançadas
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "social_accounts_select_policy" ON public.social_accounts;
DROP POLICY IF EXISTS "social_accounts_insert_policy" ON public.social_accounts;
DROP POLICY IF EXISTS "social_accounts_update_policy" ON public.social_accounts;
DROP POLICY IF EXISTS "social_accounts_delete_policy" ON public.social_accounts;

-- Política para SELECT - usuários podem ver apenas suas próprias contas
CREATE POLICY "social_accounts_select_own" ON public.social_accounts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política para INSERT - usuários podem criar contas apenas para si mesmos
CREATE POLICY "social_accounts_insert_own" ON public.social_accounts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE - usuários podem atualizar apenas suas próprias contas
CREATE POLICY "social_accounts_update_own" ON public.social_accounts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para DELETE - usuários podem deletar apenas suas próprias contas
CREATE POLICY "social_accounts_delete_own" ON public.social_accounts
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- ROUTINES - Políticas Avançadas
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "routines_select_policy" ON public.routines;
DROP POLICY IF EXISTS "routines_insert_policy" ON public.routines;
DROP POLICY IF EXISTS "routines_update_policy" ON public.routines;
DROP POLICY IF EXISTS "routines_delete_policy" ON public.routines;

-- Política para SELECT - usuários podem ver apenas suas próprias rotinas
CREATE POLICY "routines_select_own" ON public.routines
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política para INSERT - usuários podem criar rotinas apenas para si mesmos
-- e apenas para contas sociais que possuem
CREATE POLICY "routines_insert_own" ON public.routines
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.social_accounts 
            WHERE id = social_account_id AND user_id = auth.uid()
        )
    );

-- Política para UPDATE - usuários podem atualizar apenas suas próprias rotinas
CREATE POLICY "routines_update_own" ON public.routines
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.social_accounts 
            WHERE id = social_account_id AND user_id = auth.uid()
        )
    );

-- Política para DELETE - usuários podem deletar apenas suas próprias rotinas
CREATE POLICY "routines_delete_own" ON public.routines
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- PROXIES - Políticas Avançadas
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "proxies_select_policy" ON public.proxies;
DROP POLICY IF EXISTS "proxies_insert_policy" ON public.proxies;
DROP POLICY IF EXISTS "proxies_update_policy" ON public.proxies;
DROP POLICY IF EXISTS "proxies_delete_policy" ON public.proxies;

-- Política para SELECT - usuários podem ver apenas seus próprios proxies
CREATE POLICY "proxies_select_own" ON public.proxies
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política para INSERT - usuários podem criar proxies apenas para si mesmos
CREATE POLICY "proxies_insert_own" ON public.proxies
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE - usuários podem atualizar apenas seus próprios proxies
CREATE POLICY "proxies_update_own" ON public.proxies
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para DELETE - usuários podem deletar apenas seus próprios proxies
-- mas apenas se não estiverem sendo usados por rotinas ativas
CREATE POLICY "proxies_delete_own" ON public.proxies
    FOR DELETE
    USING (
        auth.uid() = user_id AND
        NOT EXISTS (
            SELECT 1 FROM public.routines 
            WHERE proxy_id = proxies.id AND status = 'active'
        )
    );

-- =====================================================
-- EXECUTION_LOGS - Políticas Avançadas
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "execution_logs_select_policy" ON public.execution_logs;
DROP POLICY IF EXISTS "execution_logs_insert_policy" ON public.execution_logs;
DROP POLICY IF EXISTS "execution_logs_update_policy" ON public.execution_logs;
DROP POLICY IF EXISTS "execution_logs_delete_policy" ON public.execution_logs;

-- Política para SELECT - usuários podem ver apenas logs de suas próprias rotinas
CREATE POLICY "execution_logs_select_own" ON public.execution_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política para INSERT - apenas o sistema pode inserir logs
-- (usuários autenticados podem inserir logs de suas próprias rotinas)
CREATE POLICY "execution_logs_insert_own" ON public.execution_logs
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.routines 
            WHERE id = routine_id AND user_id = auth.uid()
        )
    );

-- Política para UPDATE - logs não devem ser atualizados após criação
-- (apenas status pode ser atualizado em casos específicos)
CREATE POLICY "execution_logs_update_restricted" ON public.execution_logs
    FOR UPDATE
    USING (false); -- Bloqueia todas as atualizações

-- Política para DELETE - usuários podem deletar logs antigos (mais de 90 dias)
CREATE POLICY "execution_logs_delete_old" ON public.execution_logs
    FOR DELETE
    USING (
        auth.uid() = user_id AND
        created_at < (CURRENT_TIMESTAMP - INTERVAL '90 days')
    );

-- =====================================================
-- FUNÇÕES DE SEGURANÇA ADICIONAIS
-- =====================================================

-- Função para verificar se o usuário é proprietário de uma conta social
CREATE OR REPLACE FUNCTION public.is_social_account_owner(account_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.social_accounts 
        WHERE id = account_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é proprietário de uma rotina
CREATE OR REPLACE FUNCTION public.is_routine_owner(routine_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.routines 
        WHERE id = routine_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é proprietário de um proxy
CREATE OR REPLACE FUNCTION public.is_proxy_owner(proxy_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.proxies 
        WHERE id = proxy_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ÍNDICES PARA PERFORMANCE DAS POLÍTICAS RLS
-- =====================================================

-- Índices para otimizar consultas com RLS
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id_type ON public.social_accounts(user_id, type);
CREATE INDEX IF NOT EXISTS idx_routines_user_id_status ON public.routines(user_id, status);
CREATE INDEX IF NOT EXISTS idx_proxies_user_id_status ON public.proxies(user_id, status);
CREATE INDEX IF NOT EXISTS idx_execution_logs_user_id_created_at ON public.execution_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_routine_id ON public.execution_logs(routine_id);

-- =====================================================
-- TRIGGERS PARA AUDITORIA E SEGURANÇA
-- =====================================================

-- Função para log de auditoria
CREATE OR REPLACE FUNCTION public.audit_log()
RETURNS TRIGGER AS $$
BEGIN
    -- Log de auditoria pode ser implementado aqui
    -- Por exemplo, registrar mudanças importantes em uma tabela de auditoria
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para auditoria em social_accounts
DROP TRIGGER IF EXISTS audit_social_accounts ON public.social_accounts;
CREATE TRIGGER audit_social_accounts
    AFTER INSERT OR UPDATE OR DELETE ON public.social_accounts
    FOR EACH ROW EXECUTE FUNCTION public.audit_log();

-- Trigger para auditoria em routines
DROP TRIGGER IF EXISTS audit_routines ON public.routines;
CREATE TRIGGER audit_routines
    AFTER INSERT OR UPDATE OR DELETE ON public.routines
    FOR EACH ROW EXECUTE FUNCTION public.audit_log();

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON POLICY "profiles_select_own" ON public.profiles IS 'Usuários podem visualizar apenas seu próprio perfil';
COMMENT ON POLICY "social_accounts_insert_own" ON public.social_accounts IS 'Usuários podem criar contas sociais apenas para si mesmos';
COMMENT ON POLICY "routines_insert_own" ON public.routines IS 'Usuários podem criar rotinas apenas para suas próprias contas sociais';
COMMENT ON POLICY "proxies_delete_own" ON public.proxies IS 'Usuários podem deletar proxies apenas se não estiverem em uso por rotinas ativas';
COMMENT ON POLICY "execution_logs_delete_old" ON public.execution_logs IS 'Usuários podem deletar apenas logs com mais de 90 dias';

COMMENT ON FUNCTION public.is_social_account_owner(UUID) IS 'Verifica se o usuário autenticado é proprietário da conta social';
COMMENT ON FUNCTION public.is_routine_owner(UUID) IS 'Verifica se o usuário autenticado é proprietário da rotina';
COMMENT ON FUNCTION public.is_proxy_owner(UUID) IS 'Verifica se o usuário autenticado é proprietário do proxy';