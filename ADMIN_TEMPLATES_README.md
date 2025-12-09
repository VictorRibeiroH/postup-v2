# Sistema de Templates Admin - PostUp

## 📋 Visão Geral

Sistema completo para administradores criarem e gerenciarem templates de artes que os usuários podem usar no editor.

## 🗄️ Estrutura do Banco de Dados

### Tabela: `template_artes`

```sql
- id: UUID (PK)
- title: VARCHAR(255) - Título do template
- description: TEXT - Descrição opcional
- category: VARCHAR(100) - Categoria (aniversario, promocao, vaga, dica, motivacional, basico)
- template_key: VARCHAR(100) - Chave única (ex: birthday-party)
- canvas_data: JSONB - Dados do canvas do Fabric.js
- thumbnail_url: TEXT - Miniatura em base64 ou URL
- is_active: BOOLEAN - Se o template está ativo
- display_order: INTEGER - Ordem de exibição
- created_by: UUID - Usuário que criou
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## 🚀 Como Usar

### 1. Configurar Banco de Dados

Execute o arquivo SQL no Supabase:

```bash
psql -h [seu-host] -d [seu-db] -U [seu-user] -f create-template-artes-table.sql
```

**IMPORTANTE:** Edite o arquivo `create-template-artes-table.sql` e substitua `'seu-email-admin@gmail.com'` pelo seu email real nas policies de RLS!

### 2. Acessar Painel Admin

1. Faça login no PostUp
2. Acesse: `http://localhost:3000/admin/templates`
3. Você verá a lista de todos os templates (vazia inicialmente)

### 3. Criar um Novo Template

**Passo a Passo:**

1. Clique em **"Criar Novo Template"**
2. Preencha o formulário na lateral esquerda:
   - **Título**: Nome descritivo (ex: "Promoção Black Friday")
   - **Descrição**: Explicação opcional
   - **Categoria**: Escolha entre as 6 categorias
   - **Chave do Template**: Auto-gerada, mas editável (ex: `black-friday-2024`)
   - **Ordem de Exibição**: Número menor = aparece primeiro

3. **Monte o design no canvas:**
   - Use os botões "Adicionar Texto", "Adicionar Retângulo", "Adicionar Círculo"
   - Clique nos elementos para editar (mover, redimensionar, mudar cor)
   - Escolha a cor de fundo clicando nas paletas coloridas
   - **DICA:** Coloque textos genéricos que o usuário vai editar (ex: "[NOME DA EMPRESA]", "50% OFF")

4. Clique em **"Preview"** para ver como ficará

5. Clique em **"Salvar Template"**

### 4. Gerenciar Templates

Na página `/admin/templates` você pode:

- **Editar** (ícone lápis) - Em breve
- **Ativar/Desativar** (ícone olho) - Controla visibilidade para usuários
- **Deletar** (ícone lixeira) - Remove permanentemente

### 5. Templates Aparecem no Editor

Quando você salva um template:

1. Ele aparece automaticamente no editor para todos os usuários
2. Fica agrupado por categoria (🎉 Aniversário, 🔥 Promoções, etc.)
3. Usuários clicam para aplicar e depois editam os textos, cores, etc.

## 📁 Arquivos Criados

```
src/
  app/
    admin/
      templates/
        page.tsx           # Lista de templates
        create/
          page.tsx         # Criar novo template
        edit/
          [id]/
            page.tsx       # Editar template (TODO)
  components/
    ui/
      table.tsx           # Componente de tabela
      textarea.tsx        # Campo de texto (se não existia)

create-template-artes-table.sql  # Script do banco
```

## 🎨 Categorias Disponíveis

| Categoria | Icon | Descrição |
|-----------|------|-----------|
| `aniversario` | 🎉 | Aniversários e celebrações |
| `promocao` | 🔥 | Promoções, vendas, descontos |
| `vaga` | 💼 | Vagas de emprego |
| `dica` | 💡 | Dicas e conteúdo educacional |
| `motivacional` | ✨ | Frases motivacionais |
| `basico` | 📐 | Templates básicos |

## ⚙️ Configuração de Permissões

### Método Atual (Temporário)

O sistema usa o **email** para verificar se é admin. Edite o SQL:

```sql
CREATE POLICY "Admins can manage templates"
  ON template_artes
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      'victor@exemplo.com',  -- SUBSTITUA pelo seu email
      'admin@postup.com'     -- Adicione mais emails se necessário
    )
  )
```

### Método Recomendado (Futuro)

1. Adicione uma coluna `is_admin` na tabela `profiles`:
```sql
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
UPDATE profiles SET is_admin = true WHERE email = 'seu-email@gmail.com';
```

2. Atualize a policy:
```sql
DROP POLICY "Admins can manage templates" ON template_artes;

CREATE POLICY "Admins can manage templates"
  ON template_artes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
```

## 🐛 Troubleshooting

### Erro: "Você não tem permissão"

1. Verifique se seu email está na policy do SQL
2. Faça logout e login novamente
3. Verifique o console do navegador para erros

### Templates não aparecem no editor

1. Verifique se `is_active = true`
2. Verifique se a policy de SELECT está correta
3. Abra o console e procure por erros de "template_artes"

### Canvas não salva corretamente

1. Verifique se todos os campos obrigatórios estão preenchidos (título, chave)
2. A chave do template deve ser única
3. Verifique o console para erros do Supabase

## 🎯 Próximos Passos

- [ ] Implementar edição de templates existentes (`/admin/templates/edit/[id]`)
- [ ] Adicionar busca e filtros na lista de templates
- [ ] Permitir fazer upload de imagens para usar nos templates
- [ ] Copiar/duplicar templates existentes
- [ ] Histórico de versões dos templates
- [ ] Analytics de templates mais usados

## 📞 Suporte

Se tiver dúvidas, abra uma issue no repositório ou entre em contato com o time de desenvolvimento.

---

**Desenvolvido para PostUp SaaS** 🚀
