# 📘 Guia de Configuração - PostUp (Facebook Integration)

## Para o Cliente Configurar o App do Facebook

### 🎯 Objetivo
Configurar integração do PostUp com Facebook e Instagram para permitir que usuários publiquem automaticamente nas redes sociais deles.

**⏱️ Tempo estimado:** 2-3 horas  
**📋 Você vai precisar:** CNPJ, Comprovante de endereço, RG/CNH do responsável, Domínio do site

---

## 🚀 ANTES DE COMEÇAR

### Tenha em mãos:
- ✅ Seu domínio (ex: `meusite.com.br`)
- ✅ CNPJ e Contrato Social da empresa
- ✅ Comprovante de endereço recente (últimos 3 meses)
- ✅ RG ou CNH do representante legal
- ✅ Vídeo demonstrativo (fornecido pelo desenvolvedor)

---

## PASSO 1️⃣: Criar App no Facebook Developers

### 1.1 - Acessar Facebook Developers
1. Acesse: https://developers.facebook.com/
2. Faça login com **sua conta empresarial** do Facebook
3. No canto superior direito, clique em **"Meus Apps"**
4. Clique no botão verde **"Criar App"**

### 1.2 - Escolher Tipo
- Selecione: **"Empresa"** (ou **"Consumidor"** se não tiver CNPJ)
- Clique em **"Avançar"**

### 1.3 - Preencher Informações
- **Nome do app:** `PostUp` (ou o nome da sua empresa)
- **Email de contato do app:** seu-email-empresarial@empresa.com.br
- **Finalidade comercial:** Selecione sua empresa no menu
- Clique em **"Criar App"**

✅ **Pronto! Seu app foi criado.**

---

## PASSO 2️⃣: Configurações Básicas

### 2.1 - Acessar Configurações
1. No menu lateral esquerdo, clique em **"Configurações"**
2. Depois clique em **"Básico"**

### 2.2 - Preencher Campos Obrigatórios

Preencha os campos conforme o exemplo abaixo. 

**⚠️ IMPORTANTE:** Onde estiver `meusite.com.br`, substitua pelo **SEU domínio**!

| Campo | O que colocar | Exemplo |
|-------|---------------|---------|
| **Ícone do App** | Logo 1024x1024px | (arquivo fornecido) |
| **Domínios do App** | Seu domínio SEM https:// | `meusite.com.br` |
| **URL da Política de Privacidade** | Domínio + /privacy | `https://meusite.com.br/privacy` |
| **URL dos Termos de Serviço** | Domínio + /terms | `https://meusite.com.br/terms` |
| **Categoria** | Business and Pages | (escolher no menu) |

**Exemplo preenchido:**
```
Domínios do App:
meusite.com.br
www.meusite.com.br

URL da Política de Privacidade:
https://meusite.com.br/privacy

URL dos Termos de Serviço:
https://meusite.com.br/terms
```

### 2.3 - COPIAR CREDENCIAIS (MUITO IMPORTANTE!)

Role a página até encontrar:

1. **ID do App (App ID)**
   - Copie o número (ex: `1234567890123456`)
   
2. **Chave Secreta do App (App Secret)**
   - Clique em **"Mostrar"**
   - Digite sua senha do Facebook
   - Copie o código que aparecer

📋 **Cole essas informações em um lugar seguro!**

**Formato para enviar ao desenvolvedor:**
```
App ID: 1234567890123456
App Secret: abc123def456ghi789jkl012mno345pq
```

⚠️ **NÃO compartilhe essas credenciais publicamente!**

### 2.4 - Salvar
- Clique no botão azul **"Salvar alterações"** no final da página

---

## PASSO 3️⃣: Adicionar Produtos

### 3.1 - Adicionar Login do Facebook
1. No menu lateral esquerdo, procure **"Produtos"** ou **"Adicionar Produto"**
2. Encontre **"Login do Facebook"**
3. Clique em **"Configurar"** ou **"Adicionar"**

### 3.2 - Adicionar Instagram Graph API
1. No mesmo menu de produtos
2. Encontre **"Instagram Graph API"** (ou "Instagram API")
3. Clique em **"Configurar"** ou **"Adicionar"**

✅ **Seus produtos foram adicionados!**

---

## PASSO 4️⃣: Configurar Login do Facebook

### 4.1 - Acessar Configurações do Login
1. No menu lateral esquerdo, clique em **"Login do Facebook"**
2. Clique em **"Configurações"**

### 4.2 - Configurar URIs de Redirecionamento

Esta é a parte mais importante! Preste atenção:

1. Procure o campo **"URIs de redirecionamento do OAuth válidos"**
2. Cole as URLs abaixo, **substituindo `meusite.com.br` pelo SEU domínio**:

```
https://meusite.com.br/api/oauth/meta/callback
https://www.meusite.com.br/api/oauth/meta/callback
```

**Exemplo real se seu domínio for `postup.com.br`:**
```
https://postup.com.br/api/oauth/meta/callback
https://www.postup.com.br/api/oauth/meta/callback
```

⚠️ **ATENÇÃO:**
- ✅ Incluir `https://` no começo
- ✅ Incluir `/api/oauth/meta/callback` no final
- ✅ Adicionar duas linhas (com e sem www)
- ❌ NÃO esquecer nenhuma parte da URL

### 4.3 - Ativar Opções
Role a página e ative:
- ✅ **Login no OAuth do cliente:** ATIVO (botão azul)
- ✅ **Login do OAuth na Web:** ATIVO (botão azul)

### 4.4 - Salvar
- Clique em **"Salvar alterações"** no final da página

✅ **Login do Facebook configurado!**

---

## PASSO 5️⃣: Configurar Casos de Uso

### 5.1 - Acessar Casos de Uso
1. No menu lateral esquerdo, clique em **"Casos de uso"**
2. Clique em **"Adicionar"** ou **"Configurar"**

### 5.2 - Selecionar Caso de Uso
1. Procure e selecione: **"Autenticar e solicitar dados de usuários com o Login do Facebook"**
2. Clique em **"Personalizar"** ou **"Configurar"**

### 5.3 - Configurar Permissões
- Marque as permissões que serão solicitadas (veremos no próximo passo)
- Clique em **"Salvar"**

✅ **Caso de uso configurado!**

---

## PASSO 6️⃣: Solicitar Permissões (App Review)

**🎥 VOCÊ VAI PRECISAR:** Vídeo demonstrativo (fornecido pelo desenvolvedor)

### 6.1 - Acessar Revisão do App
1. No menu lateral esquerdo, clique em **"Revisão do app"**
2. Clique em **"Permissões e recursos"**

### 6.2 - Solicitar Cada Permissão

Você precisa solicitar **6 permissões**. Para cada uma:

#### 📝 **Permissão 1: pages_manage_posts**
1. Procure `pages_manage_posts` na lista
2. Clique em **"Solicitar"** ou **"Request"**
3. Preencha:
   - **Caso de uso:** Gerenciamento de conteúdo de marketing
   - **Justificativa detalhada:**
   ```
   O PostUp permite que empresas criem conteúdo visual (artes, banners, posts) 
   e agendem publicações automáticas em suas páginas do Facebook. Precisamos 
   desta permissão para publicar o conteúdo criado pelo usuário em suas próprias 
   páginas do Facebook no horário agendado.
   ```
   - **Link do vídeo:** [cole o link do YouTube fornecido pelo desenvolvedor]

#### 📝 **Permissão 2: pages_read_engagement**
1. Procure `pages_read_engagement` na lista
2. Clique em **"Solicitar"**
3. Preencha:
   - **Caso de uso:** Análise de engajamento
   - **Justificativa detalhada:**
   ```
   Precisamos exibir métricas de engajamento (curtidas, comentários, 
   compartilhamentos, alcance) dos posts publicados pelo PostUp, para que o 
   usuário possa avaliar o desempenho de suas campanhas de marketing.
   ```
   - **Link do vídeo:** [mesmo link do vídeo]

#### 📝 **Permissão 3: pages_show_list**
1. Procure `pages_show_list` na lista
2. Clique em **"Solicitar"**
3. Preencha:
   - **Caso de uso:** Gerenciamento de páginas
   - **Justificativa detalhada:**
   ```
   Precisamos listar as páginas do Facebook que o usuário administra, para que 
   ele possa escolher em qual página deseja publicar seu conteúdo.
   ```
   - **Link do vídeo:** [mesmo link do vídeo]

#### 📝 **Permissão 4: instagram_basic**
1. Procure `instagram_basic` na lista
2. Clique em **"Solicitar"**
3. Preencha:
   - **Caso de uso:** Acesso básico ao Instagram
   - **Justificativa detalhada:**
   ```
   Precisamos acessar informações básicas da conta Instagram Business do usuário 
   (nome, username, foto de perfil) para exibir na lista de contas conectadas.
   ```
   - **Link do vídeo:** [mesmo link do vídeo]

#### 📝 **Permissão 5: instagram_content_publish**
1. Procure `instagram_content_publish` na lista
2. Clique em **"Solicitar"**
3. Preencha:
   - **Caso de uso:** Publicação no Instagram
   - **Justificativa detalhada:**
   ```
   O PostUp permite agendar publicações automáticas no Instagram Business. 
   Precisamos desta permissão para publicar fotos e legendas criadas pelo usuário 
   em sua conta do Instagram.
   ```
   - **Link do vídeo:** [mesmo link do vídeo]

#### 📝 **Permissão 6: business_management**
1. Procure `business_management` na lista
2. Clique em **"Solicitar"**
3. Preencha:
   - **Caso de uso:** Acesso ao Business Manager
   - **Justificativa detalhada:**
   ```
   Precisamos acessar as páginas e contas Instagram gerenciadas pelo Business 
   Manager do usuário para permitir a conexão e publicação em múltiplas contas.
   ```
   - **Link do vídeo:** [mesmo link do vídeo]

### 6.3 - Revisar Solicitações
- Confira se as 6 permissões foram solicitadas
- Verifique se o vídeo está vinculado em todas

✅ **Permissões solicitadas!**

---

## PASSO 7️⃣: Verificação de Empresa

**📋 SEPARE OS DOCUMENTOS:**
- ✅ Cartão CNPJ (PDF da Receita Federal)
- ✅ Contrato Social ou documento equivalente
- ✅ Comprovante de endereço recente (conta de luz, água, telefone)
- ✅ RG ou CNH do representante legal

### 7.1 - Iniciar Verificação
1. No menu lateral, clique em **"Configurações"**
2. Clique em **"Verificação de empresa"**
3. Clique em **"Iniciar verificação"** ou **"Verificar empresa"**

### 7.2 - Escolher Método
- Selecione: **"Verificação por documento"**

### 7.3 - Preencher Informações

| Campo | O que colocar | Exemplo |
|-------|---------------|---------|
| **Nome legal da empresa** | Nome conforme CNPJ | MDF Tecnologia LTDA |
| **Endereço completo** | Conforme comprovante | Rua Exemplo, 123 |
| **Cidade** | Cidade da empresa | Curitiba |
| **Estado** | Estado da empresa | PR |
| **CEP** | CEP da empresa | 80000-000 |
| **País** | Brasil | Brasil |
| **Telefone** | Telefone comercial | (41) 99999-9999 |

### 7.4 - Fazer Upload dos Documentos

1. **Documento de registro empresarial:**
   - Faça upload do **Cartão CNPJ** (PDF)
   - Ou **Contrato Social** (PDF)

2. **Comprovante de endereço:**
   - Faça upload de conta de luz, água ou telefone
   - Deve ser dos **últimos 3 meses**
   - Nome e endereço devem estar visíveis

3. **Documento do representante legal:**
   - Faça upload do **RG** ou **CNH** (frente e verso)
   - Foto deve estar nítida

### 7.5 - Enviar
- Revise todos os dados
- Clique em **"Enviar"** ou **"Submit"**

### 7.6 - Aguardar
- ⏰ Tempo de análise: **1 a 5 dias úteis**
- 📧 Você receberá email com o resultado
- Se negado, corrija o que foi solicitado e reenvie

✅ **Verificação enviada! Aguarde o email de confirmação.**

---

## PASSO 8️⃣: Submeter para Revisão Final

**⚠️ SÓ FAÇA ISSO DEPOIS QUE:**
- ✅ Verificação de empresa foi APROVADA
- ✅ Todas as 6 permissões foram solicitadas
- ✅ Vídeo foi vinculado corretamente

### 8.1 - Revisar Tudo
1. Vá em **"Revisão do app"**
2. Confira se está tudo preenchido
3. Verifique se não há alertas em vermelho

### 8.2 - Enviar para Revisão
1. Clique no botão **"Enviar para revisão"** ou **"Submit for Review"**
2. Confirme o envio

### 8.3 - Aguardar Aprovação
- ⏰ Tempo de análise: **3 a 7 dias úteis**
- 📧 Facebook pode solicitar mais informações
- 📞 Responda RAPIDAMENTE para não atrasar

**Status possíveis:**
- 🟡 **Em análise:** Aguarde
- ✅ **Aprovado:** Parabéns! Vá para o próximo passo
- ❌ **Negado:** Leia os motivos, corrija e reenvie

---

## PASSO 9️⃣: Ativar o App (APÓS APROVAÇÃO)

**⚠️ SÓ FAÇA ISSO SE O APP FOI APROVADO!**

### 9.1 - Mudar para Modo Ativo
1. Vá em **"Configurações → Básico"**
2. No topo da página, você verá um botão/switch
3. Mude de **"Modo de desenvolvimento"** para **"Ativo"** (ou "Live")
4. Confirme a mudança

### 9.2 - Testar
- Acesse o PostUp no domínio configurado
- Tente conectar uma página do Facebook
- Verifique se aparece a tela de autorização
- Confirme se as páginas aparecem conectadas

✅ **APP ATIVO E FUNCIONANDO!**

---

## ⏰ ENQUANTO AGUARDA APROVAÇÃO

**Você pode testar o app ANTES da aprovação!**

### Como testar em modo de desenvolvimento:
1. Vá em **"Papéis"** no menu lateral
2. Clique em **"Administradores"**
3. Clique em **"Adicionar administradores"**
4. Digite o email da conta Facebook que vai testar
5. Pessoa precisa aceitar o convite no email

**Administradores podem:**
- ✅ Conectar páginas do Facebook
- ✅ Agendar posts
- ✅ Testar todas as funcionalidades

**Usuários normais:**
- ❌ NÃO conseguem conectar (até a aprovação)

---

## 📧 ENVIAR CREDENCIAIS PARA O DESENVOLVEDOR

Após concluir os passos 1 a 4, copie e envie:

```
=== CREDENCIAIS DO APP FACEBOOK ===

App ID: [cole aqui o ID do App]
App Secret: [cole aqui o App Secret]
Domínio: [seu domínio, ex: meusite.com.br]

Status da Verificação de Empresa: [Pendente/Aprovado]
Status do App Review: [Pendente/Aprovado]
```

**📱 Como enviar com segurança:**
- WhatsApp criptografado
- Email criptografado
- Ferramenta de compartilhamento seguro

⚠️ **NUNCA:**
- ❌ Postar em redes sociais
- ❌ Compartilhar publicamente
- ❌ Enviar por SMS

---

## 🆘 Problemas Comuns

### "Verificação de empresa negada"
**Solução:** Verifique se documentos estão legíveis e nome/endereço batem. Tente com CNPJ se usou CPF.

### "Permissão negada no App Review"
**Solução:** Leia os motivos no email. Ajuste as justificativas e grave novo vídeo se necessário.

### "Não consigo conectar páginas"
**Solução:** Confirme que você é Admin do app. Se for usuário normal, aguarde aprovação.

### "URLs inválidas"
**Solução:** Confira se colocou `https://` no começo e `/api/oauth/meta/callback` no final exatamente como no guia.

---

## 📞 Suporte

**Dúvidas técnicas sobre configuração:**
- Entre em contato com o desenvolvedor que forneceu este guia

**Problemas com Facebook Developers:**
- Suporte Meta: https://developers.facebook.com/support
- Central de ajuda: https://www.facebook.com/business/help

---

## ✅ Checklist Final

Antes de considerar concluído:

- [ ] App criado no Facebook Developers
- [ ] Configurações básicas preenchidas (domínios, URLs)
- [ ] Login do Facebook configurado (OAuth URIs)
- [ ] Instagram Graph API adicionado
- [ ] 6 permissões solicitadas com justificativas
- [ ] Vídeo demonstrativo vinculado
- [ ] Verificação de empresa APROVADA
- [ ] App Review APROVADO
- [ ] App mudado para modo ATIVO
- [ ] Credenciais enviadas ao desenvolvedor
- [ ] Teste de conexão realizado com sucesso

---

**Última atualização:** Dezembro 2025  
**Versão:** 2.0 - Guia Completo e Detalhado  
**Tempo estimado total:** 2-3 horas + 7-14 dias de espera (aprovações)
