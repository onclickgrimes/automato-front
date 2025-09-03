
### Tabelas Criadas
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- Nova tabela para workflows do editor visual
CREATE TABLE public.workflows (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.execution_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  routine_id uuid,
  social_account_id uuid,
  action_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  result jsonb DEFAULT '{}'::jsonb,
  error_message text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT execution_logs_pkey PRIMARY KEY (id),
  CONSTRAINT execution_logs_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.instagram_accounts(id),
  CONSTRAINT execution_logs_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routines(id),
  CONSTRAINT execution_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.instagram_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  username character varying NOT NULL,
  auth_type character varying NOT NULL CHECK (auth_type::text = ANY (ARRAY['credentials'::character varying, 'cookie'::character varying]::text[])),
  is_logged_in boolean DEFAULT false,
  is_monitoring boolean DEFAULT false,
  password text,
  login_time timestamp with time zone,
  logout_time timestamp with time zone,
  monitor_started_at timestamp with time zone,
  monitor_stopped_at timestamp with time zone,
  monitor_keywords ARRAY,
  auto_reply_enabled boolean DEFAULT false,
  auto_reply_message text,
  cookie text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT instagram_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT instagram_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.instagram_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid NOT NULL,
  action_type character varying NOT NULL CHECK (action_type::text = ANY (ARRAY['like'::character varying, 'comment'::character varying, 'follow'::character varying, 'unfollow'::character varying, 'upload'::character varying, 'message'::character varying]::text[])),
  target_url text,
  target_username character varying,
  comment_text text,
  result jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT instagram_actions_pkey PRIMARY KEY (id),
  CONSTRAINT instagram_actions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.instagram_accounts(id),
  CONSTRAINT instagram_actions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.instagram_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid NOT NULL,
  sender_username character varying NOT NULL,
  message_text text NOT NULL,
  message_id character varying,
  is_read boolean DEFAULT false,
  contains_keyword boolean DEFAULT false,
  matched_keyword character varying,
  auto_replied boolean DEFAULT false,
  reply_message text,
  received_at timestamp with time zone DEFAULT now(),
  replied_at timestamp with time zone,
  CONSTRAINT instagram_messages_pkey PRIMARY KEY (id),
  CONSTRAINT instagram_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT instagram_messages_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.instagram_accounts(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.proxies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  port integer NOT NULL,
  username text,
  password text,
  proxy_type text DEFAULT 'http'::text,
  is_active boolean DEFAULT true,
  status USER-DEFINED DEFAULT 'inactive'::proxy_status,
  last_tested timestamp with time zone,
  response_time integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT proxies_pkey PRIMARY KEY (id),
  CONSTRAINT proxies_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.routines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  trigger_type USER-DEFINED NOT NULL DEFAULT 'manual'::trigger_type,
  trigger_config jsonb DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  status USER-DEFINED DEFAULT 'active'::routine_status,
  social_account_id uuid,
  proxy_id uuid,
  last_executed timestamp with time zone,
  next_execution timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT routines_pkey PRIMARY KEY (id),
  CONSTRAINT routines_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT routines_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.instagram_accounts(id),
  CONSTRAINT routines_proxy_id_fkey FOREIGN KEY (proxy_id) REFERENCES public.proxies(id)
);

### Políticas RLS (Row Level Security)

Todas as tabelas possuem políticas RLS configuradas para garantir que:
- A tabela `workflows` possui políticas RLS para que usuários só possam acessar seus próprios workflows
- Usuários só podem acessar seus próprios dados
- Operações CRUD são restritas ao proprietário dos dados
- Segurança baseada em `auth.uid()` do Supabase

### Triggers e Funções

1. **`update_updated_at_column()`**: Atualiza automaticamente o campo `updated_at`
2. **`handle_new_user()`**: Cria automaticamente um perfil quando um usuário se registra
3. **Triggers**: Aplicados em todas as tabelas para manter `updated_at` (incluindo tabela `workflows`)

## Editor Visual de Workflows

### Visão Geral

O editor visual de workflows foi implementado usando `@xyflow/react` para criar uma interface drag-and-drop intuitiva para construção de workflows de automação do Instagram.

### Componentes Principais

#### 1. FlowEditor (`components/workflow/FlowEditor.tsx`)
- Componente principal que integra todo o editor
- Gerencia estado do workflow e sincronização com nodes
- Implementa funcionalidades de exportar JSON e salvar no Supabase
- Suporte completo a drag-and-drop

#### 2. StepNode (`components/workflow/StepNode.tsx`)
- Representa cada Step como um nó visual no canvas
- Exibe ações configuradas com cores diferenciadas
- Permite seleção, configuração e exclusão de steps
- Conectável através de handles (pontos de conexão)

#### 3. WorkflowSidebar (`components/workflow/WorkflowSidebar.tsx`)
- Painel lateral direito para configuração
- Configurações do workflow (quando nenhum step selecionado)
- Configurações do step selecionado (nome, condições, retry, ações)
- Formulários dinâmicos baseados no tipo de ação

#### 4. NodesSidebar (`components/workflow/NodesSidebar.tsx`)
- Painel lateral esquerdo com componentes disponíveis
- Botão para adicionar novos steps
- Lista de ações disponíveis para drag-and-drop
- Instruções de uso

### Tipos de Ações Suportadas

1. **sendDirectMessage**: Enviar mensagem direta
2. **likePost**: Curtir post específico
3. **followUser**: Seguir usuário
4. **unfollowUser**: Deixar de seguir usuário
5. **comment**: Comentar em post
6. **monitorMessages**: Monitorar mensagens recebidas
7. **monitorPosts**: Monitorar posts por hashtags
8. **delay**: Aguardar tempo específico

### Estrutura JSON do Workflow

```typescript
interface Workflow {
  id: string;
  name: string;
  description?: string;
  username: string;
  steps: WorkflowStep[];
  config?: WorkflowConfig;
}

interface WorkflowStep {
  id: string;
  name: string;
  actions: WorkflowAction[];
  condition?: string;
  retry?: {
    maxAttempts: number;
    delaySeconds: number;
  };
}

interface WorkflowAction {
  type: WorkflowActionType;
  params: WorkflowActionParams;
  description?: string;
}
```

### Funcionalidades Implementadas

#### Drag and Drop
- Arrastar ações do sidebar para o canvas cria novos steps
- Arrastar ações para steps existentes adiciona a ação ao step
- Suporte completo a detecção de drop zones

#### Configuração Visual
- Painel lateral dinâmico baseado na seleção
- Formulários específicos para cada tipo de ação
- Validação em tempo real
- Configurações avançadas do workflow

#### Persistência
- Exportar workflow como JSON
- Salvar no Supabase com RLS
- Carregar workflows existentes para edição
- Validação antes de salvar

#### Interface
- Layout responsivo ocupando tela inteira
- Sem barras de rolagem (conforme solicitado)
- Cores diferenciadas para cada tipo de ação
- Feedback visual para seleção e hover

### Rotas Implementadas

- `/dashboard/instagram/flows/create`: Criar novo workflow
- `/dashboard/instagram/flows/edit/[id]`: Editar workflow existente

### Migração do Banco

Executar o arquivo `migrations/create_workflows_table.sql` no Supabase SQL Editor para criar:
- Tabela `workflows` com RLS
- Índices para performance
- Triggers para `updated_at`
- Políticas de segurança

### Compatibilidade com Backend

O JSON exportado é totalmente compatível com o `WorkflowProcessor` do backend, mantendo:
- Estrutura exata dos tipos
- Campos opcionais apenas quando configurados
- Validação de dados antes da exportação
- Formato esperado pelos processadores de workflow atualizado

## Sistema de Posts do Instagram

### Implementação Completa

Sistema para receber e armazenar posts do Instagram coletados pelo backend.

### Estrutura do Sistema

#### 1. Migração do Banco (`migrations/create_instagram_posts_table.sql`)

Tabela `instagram_posts` com:
- **Campos principais**: `id`, `user_id`, `url`, `post_id`, `username`
- **Métricas**: `likes`, `comments`, `post_date`
- **Funcionalidades**: `liked_by_users` (jsonb), `followed_likers` (boolean)
- **Auditoria**: `created_at`, `updated_at`
- **Segurança**: RLS habilitado, políticas por usuário
- **Performance**: Índices otimizados
- **Integridade**: Constraint única por `post_id` + `user_id`

#### 2. Tipos TypeScript (`lib/types/instagram-posts.ts`)

- `InstagramPost`: Interface completa da tabela
- `InstagramPostFromBackend`: Formato recebido do backend
- `InstagramPostsPayload`: Payload completo com username e posts
- `CreateInstagramPostData`: Dados para inserção
- `UpdateInstagramPostData`: Dados para atualização
- `InstagramPostFilters`: Filtros de busca
- `InstagramPostResponse`: Resposta padrão das operações
- `InstagramPostStats`: Estatísticas dos posts

#### 3. API Endpoint (`/api/instagram-accounts/posts`)

**POST**: Receber posts do backend
- Validação completa do payload
- Extração automática de `post_id` da URL
- Upsert para evitar duplicatas
- Processamento em lote com tratamento de erros
- Resposta detalhada com sucessos e falhas

**GET**: Buscar posts do usuário
- Filtros por username, followed_likers
- Paginação com limit/offset
- Ordenação por data de criação
- Contagem de resultados

### Payload do Backend

```javascript
const payload = {
  username: username,
  posts: posts.map(post => ({
    url: post.url,
    post_id: post.post_id || post.url.match(/\/(p|reel)\/([^/]+)\//)?.[2] || post.url,
    username: post.username,
    likes: post.likes || 0,
    comments: post.comments || 0,
    post_date: post.post_date || post.date,
    liked_by_users: post.likedByUsers || [],
    followed_likers: post.followedLikers || false
  }))
};
```

### Funcionalidades Implementadas

1. **Recepção de Posts**:
   - Endpoint POST para receber dados do backend
   - Validação rigorosa de todos os campos
   - Transformação automática de formatos
   - Extração inteligente de post_id da URL

2. **Armazenamento Seguro**:
   - Upsert para evitar duplicatas
   - RLS para isolamento por usuário
   - Índices para performance otimizada
   - Triggers para auditoria automática

3. **Consulta de Posts**:
   - Endpoint GET com filtros avançados
   - Paginação eficiente
   - Busca por username e status
   - Estatísticas e contadores

4. **Tratamento de Erros**:
   - Validação detalhada com mensagens específicas
   - Processamento resiliente em lote
   - Logs detalhados para debugging
   - Respostas estruturadas com sucessos e falhas

### Segurança e Performance

- **RLS**: Usuários só acessam seus próprios posts
- **Validação**: Todos os campos são validados antes da inserção
- **Índices**: Otimizados para consultas frequentes
- **Upsert**: Evita duplicatas e conflitos
- **Paginação**: Controle de carga em consultas grandes

### Integração com Backend

O sistema está preparado para receber dados do backend Node.js/Knex, com:
- Compatibilidade total com o schema do backend
- Mapeamento automático de campos alternativos
- Tratamento de dados opcionais e nulos
- Resposta estruturada para feedback ao backend

### Autenticação via API Key

Para permitir que o backend acesse as rotas sem autenticação de usuário:

#### Configuração
1. Adicione `INTERNAL_API_KEY` no `.env.local`:
```bash
INTERNAL_API_KEY=your_secure_api_key_here_change_this
```

#### Uso no Backend
**POST** - Enviar posts:
```javascript
const response = await fetch('http://localhost:3000/api/instagram-accounts/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.INTERNAL_API_KEY
  },
  body: JSON.stringify({
    user_id: 'uuid-do-usuario',
    username: 'nome_usuario',
    posts: [...]
  })
});
```

**GET** - Buscar posts:
```javascript
const response = await fetch('http://localhost:3000/api/instagram-accounts/posts?user_id=uuid-do-usuario&username=nome_usuario', {
  headers: {
    'x-api-key': process.env.INTERNAL_API_KEY
  }
});
```

#### Segurança
- API key deve ser mantida em segredo
- Validação rigorosa do `user_id`
- Fallback para autenticação normal de usuários
- Logs de acesso para auditoria
