# PostUp - Configuração do Supabase

## 🚀 Setup Rápido

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização (se necessário)
4. Crie um novo projeto:
   - **Nome**: postup (ou o que preferir)
   - **Database Password**: escolha uma senha forte
   - **Region**: South America (São Paulo) - para melhor performance no Brasil

### 2. Copiar Credenciais

Após criar o projeto, vá em **Settings > API** e copie:

- `Project URL` → Esta é sua `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → Esta é sua `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configurar .env.local

Abra o arquivo `.env.local` na raiz do projeto e substitua:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 4. Criar as Tabelas no Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie e cole o conteúdo do arquivo `supabase-schema.sql`
4. Clique em "Run" para executar

Isso criará:
- ✅ Tabela `profiles` (dados dos usuários)
- ✅ Tabela `subscriptions` (assinaturas/pagamentos)
- ✅ Row Level Security (RLS) configurada
- ✅ Políticas de acesso

### 5. Configurar Authentication

No Supabase, vá em **Authentication > Providers**:

1. **Email** - Já vem habilitado por padrão ✅
2. (Opcional) Configure outros providers:
   - Google OAuth
   - Facebook OAuth
   - etc.

### 6. Testar

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:3000/cadastro`

3. Crie uma conta de teste

4. Verifique no Supabase:
   - **Authentication > Users** - deve aparecer o novo usuário
   - **Table Editor > profiles** - deve ter os dados do perfil
   - **Table Editor > subscriptions** - deve ter a assinatura

## 📊 Estrutura do Banco de Dados

### Tabela: `profiles`
```sql
- id (UUID, PK) → referência ao auth.users
- email (TEXT)
- full_name (TEXT)
- company_name (TEXT)
- phone (TEXT)
- plan_id (TEXT) → 'start', 'growth', 'pro', 'business', 'enterprise'
- artes_used (INTEGER) → quantas artes já foram usadas este mês
- artes_limit (INTEGER) → limite do plano (4, 8, 12, etc)
- has_ads (BOOLEAN) → se tem acesso a anúncios
- has_dashboard (BOOLEAN) → se tem acesso ao dashboard completo
```

### Tabela: `subscriptions`
```sql
- id (UUID, PK)
- user_id (UUID) → referência ao profiles.id
- plan_id (TEXT)
- status (TEXT) → 'active', 'cancelled', 'expired'
- price (DECIMAL)
- started_at (TIMESTAMP)
- expires_at (TIMESTAMP)
```

## 🔒 Segurança (RLS)

As políticas de Row Level Security garantem que:
- ✅ Usuários só veem seus próprios dados
- ✅ Usuários só podem editar seus próprios perfis
- ✅ Não é possível acessar dados de outros usuários

## 🎯 Planos Configurados

| Plano | Preço | Artes/Mês | Anúncios | Dashboard |
|-------|-------|-----------|----------|-----------|
| START | R$ 100 | 4 | ❌ | ❌ |
| GROWTH | R$ 180 | 8 | ❌ | ❌ |
| PRO | R$ 249 | 12 | ❌ | ❌ |
| BUSINESS | R$ 250 | 4 | ✅ | ❌ |
| ENTERPRISE | R$ 500 | 12 | ✅ | ✅ |

## 🐛 Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou corretamente as credenciais
- Certifique-se de que o `.env.local` está na raiz do projeto
- Reinicie o servidor após alterar variáveis de ambiente

### Erro: "relation profiles does not exist"
- Execute o script SQL `supabase-schema.sql` no SQL Editor
- Aguarde alguns segundos para as tabelas serem criadas

### Usuário criado mas sem dados no profile
- Verifique se as políticas RLS estão configuradas corretamente
- Verifique se o trigger foi criado no banco

## 📝 Próximos Passos

Após configurar o Supabase, você pode:
1. ✅ Criar contas de usuários
2. ✅ Fazer login/logout
3. 🔜 Criar o dashboard do usuário
4. 🔜 Implementar o editor de artes (Fabric.js)
5. 🔜 Integrar com Meta API (Facebook/Instagram)

---

**Documentação completa:** [supabase.com/docs](https://supabase.com/docs)
