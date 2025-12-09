# Sistema de Gerenciamento de Planos - PostUp

## O que foi implementado:

### 1. Banco de Dados (add-plans-table.sql)
- ✅ Tabela `plans`: armazena informações dos planos (nome, preço, descrição, limites, etc.)
- ✅ Tabela `plan_features`: features/características de cada plano
- ✅ RLS Policies: apenas admins podem criar/editar, todos veem planos ativos
- ✅ Dados iniciais: 5 planos pré-cadastrados (START, GROWTH, PRO, BUSINESS, ENTERPRISE)

### 2. Componente Admin (PlansManagementCard.tsx)
**Funcionalidades:**
- ✅ Criar novo plano
- ✅ Editar plano existente
- ✅ Deletar plano
- ✅ Gerenciar features dinamicamente (adicionar/remover)
- ✅ Configurar:
  - ID do plano (único, ex: 'start', 'pro')
  - Nome (ex: 'START', 'PRO')
  - Preço em R$
  - Descrição completa
  - Limite de artes
  - Gestão de anúncios (sim/não)
  - Dashboard (sim/não)
  - Marcar como "Popular"
  - Badge customizado (ex: "MAIS POPULAR")
  - Features/características (lista dinâmica)

### 3. Landing Page Atualizada (PricingSection.tsx)
- ✅ Carrega planos direto do banco de dados
- ✅ Exibe apenas planos ativos
- ✅ Ordem configurável (display_order)
- ✅ Badge "MAIS POPULAR" dinâmico
- ✅ Features carregadas do banco
- ✅ Link de cadastro com plan_id correto

### 4. Integração Admin Panel
- ✅ Adicionado PlansManagementCard no /admin
- ✅ Aparece junto com VideoSettings e PartnersManagement

## Como usar:

### Passo 1: Executar SQL
Execute `add-plans-table.sql` no SQL Editor do Supabase

### Passo 2: Gerenciar Planos
1. Acesse `/admin`
2. Vá até "Gerenciar Planos"
3. Clique em "Novo Plano" para criar
4. Ou clique no botão de editar (lápis) para modificar
5. Preencha os campos:
   - **ID do Plano**: identificador único (ex: 'premium', 'basic')
   - **Nome**: nome exibido (ex: 'PREMIUM', 'BASIC')
   - **Preço**: valor em reais (ex: 199.00)
   - **Limite de Artes**: quantidade de artes permitidas
   - **Descrição**: texto explicativo do plano
   - **Features**: características (botão + para adicionar mais)
   - **Checkboxes**: anúncios, dashboard, popular
   - **Badge**: texto customizado se popular

### Passo 3: Visualizar
- Os planos aparecem automaticamente na landing page (/#planos)
- Usuários podem escolher e se cadastrar
- Planos inativos não aparecem para público

## Campos Importantes:

### plan_id (string)
- Identificador único do plano
- Usado em URLs e código
- Ex: 'start', 'pro', 'enterprise'
- Convertido para lowercase automaticamente

### display_order (number)
- Define ordem de exibição
- Menor número = aparece primeiro

### is_active (boolean)
- true: plano visível para todos
- false: plano oculto (apenas admin vê)

### is_popular (boolean)
- true: destaque com badge e estilo especial
- false: estilo normal

## Dados Atuais:
Os 5 planos atuais estão pré-cadastrados no SQL:
1. START - R$ 100
2. GROWTH - R$ 180
3. PRO - R$ 249 (Popular)
4. BUSINESS - R$ 250
5. ENTERPRISE - R$ 500

Você pode editar, deletar ou criar novos pelo admin!
