# 📘 Guia de Configuração - PostUp (Facebook Integration)

## Para o Cliente Configurar o App do Facebook

### 🎯 Objetivo
Configurar integração do PostUp com Facebook e Instagram para permitir que usuários publiquem automaticamente nas redes sociais deles.

---

## PASSO 1: Criar App no Facebook Developers

1. Acesse: https://developers.facebook.com/
2. Faça login com a conta empresarial do Facebook
3. Clique em **"Meus Apps"** → **"Criar App"**
4. Escolha: **"Empresa"** ou **"Consumidor"**
5. Preencha:
   - **Nome do App:** PostUp
   - **Email de contato:** seu-email@empresa.com
   - **Finalidade comercial:** Selecione sua empresa

---

## PASSO 2: Configurações Básicas

1. Vá em **Configurações → Básico**
2. Preencha:
   - ✅ **Ícone do App:** Logo 1024x1024px (fornecido)
   - ✅ **Domínios do App:** `seudominio.com.br`
   - ✅ **URL da Política de Privacidade:** `https://seudominio.com.br/privacy`
   - ✅ **URL dos Termos de Serviço:** `https://seudominio.com.br/terms`
   - ✅ **Categoria:** Business and Pages

3. **Copie as credenciais:**
   - 📋 **ID do App** (App ID)
   - 📋 **Chave Secreta do App** (App Secret) - Clique em "Mostrar"

**Envie essas credenciais para o desenvolvedor via canal seguro!**

---

## PASSO 3: Adicionar Produtos

1. No painel lateral, clique em **"Adicionar Produto"**
2. Adicione:
   - ✅ **Login do Facebook**
   - ✅ **Instagram Graph API** (se disponível)

---

## PASSO 4: Configurar Login do Facebook

1. Vá em **Produtos → Login do Facebook → Configurações**
2. Em **"URIs de redirecionamento do OAuth válidos"**, adicione:
```
https://seudominio.com.br/api/oauth/meta/callback
```
3. Ative:
   - ✅ Login no OAuth do cliente: **SIM**
   - ✅ Login do OAuth na Web: **SIM**
4. Salve

---

## PASSO 5: Configurar Casos de Uso

1. Vá em **Casos de uso**
2. Adicione: **"Autenticar e solicitar dados de usuários com o Login do Facebook"**
3. Clique em **Personalizar**
4. Configure as permissões necessárias

---

## PASSO 6: Solicitar Permissões (App Review)

1. Vá em **Revisão do app → Permissões e recursos**
2. Solicite estas permissões:
   - `pages_manage_posts` - Publicar em páginas
   - `pages_read_engagement` - Ler métricas
   - `instagram_basic` - Info básica do Instagram
   - `instagram_content_publish` - Publicar no Instagram
   - `pages_show_list` - Listar páginas do usuário

3. Para cada permissão, forneça:
   - Justificativa clara
   - Vídeo demonstrativo (fornecido pelo desenvolvedor)
   - Instruções de teste

---

## PASSO 7: Verificação de Empresa

1. Vá em **Configurações → Verificação de Empresa**
2. Upload dos documentos:
   - CNPJ / Contrato Social
   - Comprovante de endereço
   - Documento do representante legal

---

## PASSO 8: Submeter para Revisão

1. Após preencher tudo, clique em **"Enviar para Revisão"**
2. Aguarde 3-7 dias úteis
3. Facebook pode solicitar ajustes
4. Responda rapidamente para não atrasar

---

## PASSO 9: Ativar o App (SOMENTE após aprovação)

1. Vá em **Configurações → Básico**
2. No topo, mude de **"Desenvolvimento"** para **"Ativo"**
3. Confirme

---

## ⚠️ IMPORTANTE - Enquanto em Desenvolvimento

**Para testar antes da aprovação:**
1. Vá em **Papéis → Administradores**
2. Adicione você mesmo e membros da equipe como Admin
3. Admins podem testar todas as funcionalidades

---

## 📧 Credenciais para o Desenvolvedor

Após criar o app, envie com segurança:

```
App ID: [cole aqui]
App Secret: [cole aqui]
```

⚠️ **NUNCA compartilhe o App Secret publicamente!**

---

## 🆘 Suporte

Dúvidas? Entre em contato com o desenvolvedor que forneceu este guia.

---

**Última atualização:** Dezembro 2025
**Versão:** 1.0
