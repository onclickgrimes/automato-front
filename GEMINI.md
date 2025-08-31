# Documentação do Banco de Dados - Automato SaaS

## Schema do Banco de Dados Supabase

### Migrações Recentes

#### 2025-01-20: Correção do Constraint auth_type
- **Arquivo**: `fix_auth_type_constraint.sql`
- **Problema**: O constraint da tabela `instagram_accounts` só aceitava 'credentials' e mas o frontend estava enviando 'cookie'
- **Solução**: Atualizado o constraint para aceitar tanto 'cookie' quanto 'cookies'
- **Comando**: `ALTER TABLE instagram_accounts ADD CONSTRAINT instagram_accounts_auth_type_check CHECK (auth_type IN ('credentials', 'cookie'));`

### Tabelas Criadas

#### 1. `public.profiles`
- **Descrição**: Perfis dos usuários com relacionamento one-to-one com `auth.users`
- **Campos**:
  - `id` (UUID, PK): Referência para `auth.users(id)`
  - `email` (TEXT): Email do usuário
  - `full_name` (TEXT): Nome completo
  - `avatar_url` (TEXT): URL do avatar
  - `created_at`, `updated_at` (TIMESTAMP)

#### 2. `public.social_accounts`
- **Descrição**: Contas de redes sociais dos usuários
- **Campos**:
  - `id` (UUID, PK): Identificador único
  - `user_id` (UUID, FK): Referência para `auth.users(id)`
  - `type` (ENUM): 'instagram', 'whatsapp', 'facebook'
  - `username` (TEXT): Nome de usuário da conta social
  - `display_name` (TEXT): Nome de exibição
  - `session_data` (JSONB): Dados de sessão para automação
  - `is_active` (BOOLEAN): Status da conta
  - `last_login` (TIMESTAMP): Último login
  - `created_at`, `updated_at` (TIMESTAMP)

#### 3. `public.routines`
- **Descrição**: Rotinas de automação dos usuários
- **Campos**:
  - `id` (UUID, PK): Identificador único
  - `user_id` (UUID, FK): Referência para `auth.users(id)`
  - `name` (TEXT): Nome da rotina
  - `description` (TEXT): Descrição da rotina
  - `trigger_type` (ENUM): 'cron', 'manual', 'event'
  - `trigger_config` (JSONB): Configurações do trigger
  - `actions` (JSONB): Array de ações a executar
  - `is_active` (BOOLEAN): Status da rotina
  - `last_executed`, `next_execution` (TIMESTAMP)
  - `created_at`, `updated_at` (TIMESTAMP)

#### 4. `public.proxies`
- **Descrição**: Proxies dos usuários para automação
- **Campos**:
  - `id` (UUID, PK): Identificador único
  - `user_id` (UUID, FK): Referência para `auth.users(id)`
  - `name` (TEXT): Nome do proxy
  - `address` (TEXT): Endereço do proxy
  - `port` (INTEGER): Porta do proxy

#### 5. `public.instagram_accounts`
- **Descrição**: Contas do Instagram para automação com múltiplas contas
- **Campos**:
  - `id` (UUID, PK): Identificador único
  - `user_id` (UUID, FK): Referência para `auth.users(id)`
  - `username` (VARCHAR): Nome de usuário do Instagram
  - `auth_type` (VARCHAR): Tipo de autenticação ('credentials', 'cookies')
  - `is_logged_in` (BOOLEAN): Status de login
  - `is_monitoring` (BOOLEAN): Status de monitoramento
  - `login_time`, `logout_time` (TIMESTAMPTZ): Timestamps de login/logout
  - `monitor_started_at`, `monitor_stopped_at` (TIMESTAMPTZ): Timestamps de monitoramento
  - `monitor_keywords` (TEXT[]): Palavras-chave para monitoramento
  - `auto_reply_enabled` (BOOLEAN): Resposta automática habilitada
  - `auto_reply_message` (TEXT): Mensagem de resposta automática
  - `profile_data` (JSONB): Dados do perfil do Instagram
  - `created_at`, `updated_at` (TIMESTAMPTZ)

#### 6. `public.instagram_actions`
- **Descrição**: Registro de ações executadas no Instagram
- **Campos**:
  - `id` (UUID, PK): Identificador único
  - `user_id` (UUID, FK): Referência para `auth.users(id)`
  - `account_id` (UUID, FK): Referência para `instagram_accounts(id)`
  - `action_type` (VARCHAR): Tipo de ação ('like', 'comment', 'follow', 'unfollow', 'upload', 'message')
  - `target_url` (TEXT): URL do alvo da ação
  - `target_username` (VARCHAR): Username do alvo
  - `comment_text` (TEXT): Texto do comentário
  - `result` (JSONB): Resultado da ação
  - `created_at` (TIMESTAMPTZ)

#### 7. `public.instagram_messages`
- **Descrição**: Mensagens monitoradas do Instagram
- **Campos**:
  - `id` (UUID, PK): Identificador único
  - `user_id` (UUID, FK): Referência para `auth.users(id)`
  - `account_id` (UUID, FK): Referência para `instagram_accounts(id)`
  - `sender_username` (VARCHAR): Username do remetente
  - `message_text` (TEXT): Texto da mensagem
  - `message_id` (VARCHAR): ID da mensagem no Instagram
  - `is_read` (BOOLEAN): Status de leitura
  - `contains_keyword` (BOOLEAN): Contém palavra-chave
  - `matched_keyword` (VARCHAR): Palavra-chave encontrada
  - `auto_replied` (BOOLEAN): Resposta automática enviada
  - `reply_message` (TEXT): Mensagem de resposta
  - `received_at`, `replied_at` (TIMESTAMPTZ)
  - `username`, `password` (TEXT): Credenciais do proxy
  - `proxy_type` (TEXT): Tipo do proxy (http, https, socks5)
  - `is_active` (BOOLEAN): Status do proxy
  - `last_tested` (TIMESTAMP): Último teste
  - `response_time` (INTEGER): Tempo de resposta em ms
  - `created_at`, `updated_at` (TIMESTAMP)

#### 5. `public.execution_logs`
- **Descrição**: Logs de execução das rotinas e ações
- **Campos**:
  - `id` (UUID, PK): Identificador único
  - `user_id` (UUID, FK): Referência para `auth.users(id)`
  - `routine_id` (UUID, FK): Referência para `routines(id)`
  - `social_account_id` (UUID, FK): Referência para `social_accounts(id)`
  - `action_type` (TEXT): Tipo da ação executada
  - `status` (TEXT): Status da execução (pending, running, success, error)
  - `result` (JSONB): Resultado da execução
  - `error_message` (TEXT): Mensagem de erro se houver
  - `started_at`, `completed_at` (TIMESTAMP)
  - `created_at` (TIMESTAMP)

### Políticas RLS (Row Level Security)

Todas as tabelas possuem políticas RLS configuradas para garantir que:
- Usuários só podem acessar seus próprios dados
- Operações CRUD são restritas ao proprietário dos dados
- Segurança baseada em `auth.uid()` do Supabase

### Triggers e Funções

1. **`update_updated_at_column()`**: Atualiza automaticamente o campo `updated_at`
2. **`handle_new_user()`**: Cria automaticamente um perfil quando um usuário se registra
3. **Triggers**: Aplicados em todas as tabelas para manter `updated_at` atualizado

### Índices

Índices criados para otimizar consultas frequentes:
- Por `user_id` em todas as tabelas
- Por `type` em `social_accounts`
- Por `is_active` em `routines` e `proxies`
- Por `status` em `execution_logs`

## Como Aplicar as Migrações

### Migração Principal
1. Acesse o painel do Supabase
2. Vá para a seção "SQL Editor"
3. Cole o conteúdo do arquivo `supabase_migration.sql`
4. Execute a migração
5. Verifique se todas as tabelas foram criadas corretamente

### Políticas RLS Avançadas
1. Após aplicar a migração principal, execute o arquivo `supabase_rls_policies.sql`
2. Este arquivo contém políticas RLS mais específicas e otimizadas
3. Inclui funções de segurança adicionais e índices de performance
4. Configura triggers de auditoria para monitoramento

## Migrações Aplicadas

### Migração Instagram (2024-01-20)
- **Arquivo**: `instagram_migration.sql`
- **Descrição**: Implementação completa do sistema de múltiplas contas do Instagram
- **Tabelas Criadas**:
  - `instagram_accounts`: Gerenciamento de múltiplas contas
  - `instagram_actions`: Log de ações executadas
  - `instagram_messages`: Monitoramento de mensagens
- **Recursos**:
  - Suporte a autenticação por credenciais e cookies
  - Sistema de monitoramento de mensagens com palavras-chave
  - Resposta automática configurável
  - Políticas RLS para segurança
  - Índices otimizados para performance
  - Triggers automáticos para updated_at

### APIs Implementadas
- `POST /api/instagram/login`: Login em contas do Instagram
- `POST /api/instagram/logout`: Logout de contas
- `GET /api/instagram/status`: Status das contas
- `POST /api/instagram/actions`: Execução de ações (like, comment, follow, etc.)
- `POST /api/instagram/monitor`: Controle de monitoramento
- `GET /api/instagram/monitor`: Busca de mensagens monitoradas

## Políticas RLS Implementadas

### Profiles
- `profiles_select_own`: Usuários visualizam apenas seu próprio perfil
- `profiles_insert_own`: Inserção apenas durante criação automática
- `profiles_update_own`: Usuários atualizam apenas seu próprio perfil
- `profiles_delete_own`: Usuários deletam apenas seu próprio perfil

### Social Accounts
- `social_accounts_select_own`: Acesso apenas às próprias contas
- `social_accounts_insert_own`: Criação apenas para si mesmo
- `social_accounts_update_own`: Atualização apenas das próprias contas
- `social_accounts_delete_own`: Exclusão apenas das próprias contas

### Routines
- `routines_select_own`: Visualização apenas das próprias rotinas
- `routines_insert_own`: Criação apenas para contas sociais próprias
- `routines_update_own`: Atualização com validação de propriedade
- `routines_delete_own`: Exclusão apenas das próprias rotinas

### Proxies
- `proxies_select_own`: Acesso apenas aos próprios proxies
- `proxies_insert_own`: Criação apenas para si mesmo
- `proxies_update_own`: Atualização apenas dos próprios proxies
- `proxies_delete_own`: Exclusão apenas se não estiver em uso por rotinas ativas

### Execution Logs
- `execution_logs_select_own`: Visualização apenas de logs próprios
- `execution_logs_insert_own`: Inserção apenas para rotinas próprias
- `execution_logs_update_restricted`: Atualizações bloqueadas
- `execution_logs_delete_old`: Exclusão apenas de logs com mais de 90 dias

## Funções de Segurança

- `is_social_account_owner(UUID)`: Verifica propriedade de conta social
- `is_routine_owner(UUID)`: Verifica propriedade de rotina
- `is_proxy_owner(UUID)`: Verifica propriedade de proxy

## Considerações de Segurança

- Todas as tabelas possuem RLS (Row Level Security) habilitado
- Políticas específicas garantem isolamento total entre usuários
- Validações cruzadas impedem acesso não autorizado
- Funções de segurança facilitam verificações de propriedade
- Triggers de auditoria monitoram mudanças importantes
- Índices otimizados para performance das políticas RLS
- Logs antigos podem ser removidos automaticamente (90+ dias)
- Proxies em uso por rotinas ativas não podem ser deletados