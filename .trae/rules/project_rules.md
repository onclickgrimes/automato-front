
### Tabelas Criadas
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

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
  login_time timestamp with time zone,
  logout_time timestamp with time zone,
  monitor_started_at timestamp with time zone,
  monitor_stopped_at timestamp with time zone,
  monitor_keywords ARRAY,
  auto_reply_enabled boolean DEFAULT false,
  auto_reply_message text,
  profile_data jsonb,
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
- Usuários só podem acessar seus próprios dados
- Operações CRUD são restritas ao proprietário dos dados
- Segurança baseada em `auth.uid()` do Supabase

### Triggers e Funções

1. **`update_updated_at_column()`**: Atualiza automaticamente o campo `updated_at`
2. **`handle_new_user()`**: Cria automaticamente um perfil quando um usuário se registra
3. **Triggers**: Aplicados em todas as tabelas para manter `updated_at` 


# Sistema CRUD para Contas do Instagram

Este documento descreve o sistema completo de CRUD (Create, Read, Update, Delete) implementado para gerenciar contas do Instagram no Supabase.

## Estrutura do Sistema

### 1. Tipos TypeScript (`lib/types/instagram-accounts.ts`)

Define todos os tipos necessários baseados no schema do banco de dados:

- `InstagramAuthType`: Tipos de autenticação ('credentials' | 'cookie')
- `InstagramAccount`: Interface completa da conta
- `CreateInstagramAccountData`: Dados para criação
- `UpdateInstagramAccountData`: Dados para atualização
- `InstagramAccountFilters`: Filtros para busca
- `InstagramAccountResponse`: Resposta padrão das operações
- `ValidationError` e `ValidationResult`: Para validações

### 2. Serviço CRUD (`lib/services/instagram-accounts.ts`)

Classe `InstagramAccountsService` com todas as operações:

#### Operações Principais
- `create(data)`: Criar nova conta
- `getById(id)`: Buscar por ID
- `getByFilters(filters)`: Buscar com filtros
- `update(id, data)`: Atualizar conta
- `delete(id)`: Excluir conta

#### Operações Especiais
- `getByUserId(userId)`: Contas de um usuário
- `getActiveAccounts(userId?)`: Contas logadas
- `getMonitoringAccounts(userId?)`: Contas em monitoramento
- `countByUserId(userId)`: Contar contas
- `updateLoginStatus(id, isLoggedIn)`: Atualizar status de login
- `updateMonitoringStatus(id, isMonitoring)`: Atualizar status de monitoramento

### 3. Rotas de API

#### Rota Principal (`/api/instagram-accounts`)
- `GET`: Buscar contas com filtros
- `POST`: Criar nova conta

#### Rota por ID (`/api/instagram-accounts/[id]`)
- `GET`: Buscar conta específica
- `PUT`: Atualizar conta
- `DELETE`: Excluir conta

#### Rotas Especiais
- `GET /api/instagram-accounts/count`: Contar contas
- `GET /api/instagram-accounts/active`: Contas ativas
- `GET /api/instagram-accounts/monitoring`: Contas em monitoramento
- `PUT /api/instagram-accounts/[id]/login-status`: Atualizar status de login
- `PUT /api/instagram-accounts/[id]/monitoring-status`: Atualizar status de monitoramento

### 4. Hook React (`lib/hooks/useInstagramAccountsCRUD.ts`)

Hook personalizado que facilita o uso no frontend com:
- Estados de loading e error
- Todas as operações CRUD
- Tratamento automático de erros
- Funções utilitárias

## Como Usar

### No Frontend (React)

```typescript
import { useInstagramAccountsCRUD } from '@/lib/hooks/useInstagramAccountsCRUD';

function MyComponent() {
  const {
    loading,
    error,
    createAccount,
    getAccounts,
    updateAccount,
    deleteAccount,
    clearError
  } = useInstagramAccountsCRUD();

  // Criar conta
  const handleCreate = async () => {
    const newAccount = await createAccount({
      username: 'minha_conta',
      auth_type: 'credentials',
      password: 'senha123'
    });
    
    if (newAccount) {
      console.log('Conta criada:', newAccount);
    }
  };

  // Buscar contas
  const handleGetAccounts = async () => {
    const accounts = await getAccounts({
      is_logged_in: true
    });
    console.log('Contas ativas:', accounts);
  };

  // Atualizar conta
  const handleUpdate = async (id: string) => {
    const updated = await updateAccount(id, {
      auto_reply_enabled: true,
      auto_reply_message: 'Obrigado pela mensagem!'
    });
    
    if (updated) {
      console.log('Conta atualizada:', updated);
    }
  };

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && (
        <div>
          <p>Erro: {error}</p>
          <button onClick={clearError}>Limpar Erro</button>
        </div>
      )}
      {/* Seu componente aqui */}
    </div>
  );
}
```

### Diretamente via API

```typescript
// Criar conta
const response = await fetch('/api/instagram-accounts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'minha_conta',
    auth_type: 'credentials',
    password: 'senha123'
  })
});

// Buscar contas ativas
const activeAccounts = await fetch('/api/instagram-accounts/active');

// Atualizar status de monitoramento
const updateMonitoring = await fetch('/api/instagram-accounts/123/monitoring-status', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ is_monitoring: true })
});
```

### Usando o Serviço Diretamente

```typescript
import { instagramAccountsService } from '@/lib/services/instagram-accounts';

// Criar conta
const result = await instagramAccountsService.create({
  user_id: 'user-uuid',
  username: 'minha_conta',
  auth_type: 'credentials',
  password: 'senha123'
});

if (result.success) {
  console.log('Conta criada:', result.data);
} else {
  console.error('Erro:', result.error);
}
```

## Validações Implementadas

### Campos Obrigatórios (Criação)
- `user_id`: ID do usuário (UUID)
- `username`: Nome de usuário (string não vazia)
- `auth_type`: Tipo de autenticação ('credentials' | 'cookie')

### Validações de Dados
- `username`: Deve ser string não vazia
- `auth_type`: Deve ser 'credentials' ou 'cookie'
- `monitor_keywords`: Deve ser array (se fornecido)
- `profile_data`: Deve ser objeto JSON válido (se fornecido)

### Validações de Negócio
- Username único por usuário
- Conta deve estar logada para iniciar monitoramento
- Verificação de registros relacionados antes da exclusão

## Segurança

### Autenticação
- Todas as rotas verificam autenticação via Supabase
- Usuários só podem acessar suas próprias contas

### Autorização
- Verificação de propriedade da conta em operações específicas
- Filtros automáticos por `user_id`

### Validação de Dados
- Sanitização de entrada
- Validação de tipos
- Prevenção de SQL injection via Supabase

## Tratamento de Erros

### Códigos de Status HTTP
- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Dados inválidos
- `401`: Não autorizado
- `403`: Acesso negado
- `404`: Não encontrado
- `500`: Erro interno

### Estrutura de Resposta
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  count?: number;
  message?: string;
}
```

## Conformidade com o Schema

O sistema está totalmente alinhado com o schema definido em `db_schema.md`:

- Respeita todos os tipos de dados
- Implementa constraints de chave estrangeira
- Valida campos obrigatórios
- Mantém integridade referencial
- Suporta todos os campos opcionais

## Extensibilidade

O sistema foi projetado para ser facilmente extensível:

- Novos filtros podem ser adicionados facilmente
- Validações customizadas podem ser implementadas
- Novas rotas especiais podem ser criadas
- Hooks adicionais podem ser desenvolvidos

## Logs e Monitoramento

- Todos os erros são logados no console
- Operações importantes incluem mensagens de sucesso
- Estrutura preparada para integração com sistemas de logging