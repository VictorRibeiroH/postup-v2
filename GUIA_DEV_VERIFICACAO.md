# 🔧 Guia do Desenvolvedor - Verificação de Negócios Facebook

## Objetivo
Este guia te ajuda a **preparar e passar pela verificação de negócios** do Facebook como desenvolvedor, para testar o app em modo produção antes de transferir para o cliente.

---

## ⚠️ IMPORTANTE - Entenda os Cenários

### Cenário 1: Testar como Admin (Desenvolvimento)
- ✅ **Não precisa** de verificação de negócios
- ✅ Adicione-se como Admin no app
- ❌ Só você e outros Admins/Testadores podem usar
- ❌ Usuários normais vão ver erro de permissões

### Cenário 2: Testar em Produção (App Review)
- ✅ Qualquer usuário pode usar
- ⚠️ **Precisa** de verificação de negócios
- ⚠️ **Precisa** de App Review (3-7 dias)
- ⚠️ **Precisa** de Privacy/Terms públicos

**Este guia é para o Cenário 2.**

---

## PARTE 1: Preparação (Antes da Verificação)

### 1.1 - Criar Páginas Obrigatórias

**Privacy Policy (`/privacy`):**
```typescript
// src/app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Dados Coletados</h2>
        <p>Coletamos as seguintes informações quando você usa o PostUp:</p>
        <ul className="list-disc pl-6">
          <li>Nome completo e email (fornecidos no cadastro)</li>
          <li>Informações da sua página do Facebook (nome, ID, foto, número de seguidores)</li>
          <li>Informações da sua conta Instagram Business (nome, username, foto, seguidores)</li>
          <li>Conteúdo das artes criadas (imagens, textos, designs)</li>
          <li>Posts agendados e publicados</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">2. Como Usamos os Dados</h2>
        <ul className="list-disc pl-6">
          <li>Publicar posts automaticamente nas suas páginas/contas conectadas</li>
          <li>Exibir métricas de engajamento (curtidas, comentários, alcance)</li>
          <li>Armazenar histórico de publicações</li>
          <li>Melhorar a experiência do usuário</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">3. Armazenamento</h2>
        <p>Seus dados são armazenados de forma segura no Supabase (PostgreSQL) com:</p>
        <ul className="list-disc pl-6">
          <li>Criptografia em trânsito (HTTPS/TLS)</li>
          <li>Autenticação obrigatória (Row Level Security)</li>
          <li>Tokens de acesso protegidos</li>
          <li>Backups automáticos diários</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">4. Seus Direitos</h2>
        <p>Você pode a qualquer momento:</p>
        <ul className="list-disc pl-6">
          <li>Desconectar suas contas sociais</li>
          <li>Deletar sua conta e todos os dados associados</li>
          <li>Exportar seus dados (solicite via email)</li>
          <li>Revogar permissões no Facebook/Instagram</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">5. Retenção de Dados</h2>
        <p>Mantemos seus dados enquanto sua conta estiver ativa. Após deletar a conta, seus dados são removidos em até 30 dias.</p>

        <h2 className="text-2xl font-semibold mt-8">6. Compartilhamento</h2>
        <p>NÃO compartilhamos seus dados com terceiros, exceto:</p>
        <ul className="list-disc pl-6">
          <li>Facebook/Instagram (para publicar posts)</li>
          <li>Quando exigido por lei</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">7. Contato</h2>
        <p>Para dúvidas sobre privacidade: contato@postup.com.br</p>

        <p className="text-sm text-gray-500 mt-8">Última atualização: Dezembro 2025</p>
      </section>
    </div>
  )
}
```

**Terms of Service (`/terms`):**
```typescript
// src/app/terms/page.tsx
export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Descrição do Serviço</h2>
        <p>O PostUp é uma plataforma que permite criar conteúdos visuais e agendar publicações automáticas no Facebook e Instagram.</p>

        <h2 className="text-2xl font-semibold mt-8">2. Responsabilidades do Usuário</h2>
        <p>Ao usar o PostUp, você concorda em:</p>
        <ul className="list-disc pl-6">
          <li>Possuir direitos sobre todo conteúdo publicado (imagens, textos, etc)</li>
          <li>Seguir as políticas do Facebook e Instagram</li>
          <li>Não publicar conteúdo ilegal, ofensivo ou que viole direitos autorais</li>
          <li>Ser responsável por todo conteúdo publicado através da plataforma</li>
          <li>Manter suas credenciais de acesso seguras</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">3. Limitações do Serviço</h2>
        <p>O PostUp:</p>
        <ul className="list-disc pl-6">
          <li>NÃO garante que posts sejam publicados se houver falhas na API do Facebook/Instagram</li>
          <li>NÃO se responsabiliza por mudanças nas políticas das redes sociais</li>
          <li>NÃO garante métricas específicas de engajamento</li>
          <li>Pode ter indisponibilidade temporária para manutenção</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">4. Cancelamento</h2>
        <p>Você pode cancelar sua conta a qualquer momento através das configurações. Seus dados serão deletados em até 30 dias.</p>

        <h2 className="text-2xl font-semibold mt-8">5. Modificações</h2>
        <p>Podemos modificar estes termos a qualquer momento. Usuários serão notificados por email.</p>

        <h2 className="text-2xl font-semibold mt-8">6. Limitação de Responsabilidade</h2>
        <p>O PostUp é fornecido "como está". Não nos responsabilizamos por:</p>
        <ul className="list-disc pl-6">
          <li>Perda de dados devido a falhas técnicas</li>
          <li>Violações de políticas do Facebook/Instagram pelo usuário</li>
          <li>Banimentos ou restrições aplicadas pelas redes sociais</li>
          <li>Danos indiretos ou lucros cessantes</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">7. Lei Aplicável</h2>
        <p>Estes termos são regidos pelas leis brasileiras.</p>

        <h2 className="text-2xl font-semibold mt-8">8. Contato</h2>
        <p>Para dúvidas: contato@postup.com.br</p>

        <p className="text-sm text-gray-500 mt-8">Última atualização: Dezembro 2025</p>
      </section>
    </div>
  )
}
```

**✅ Checklist:**
- [ ] Criar `src/app/privacy/page.tsx`
- [ ] Criar `src/app/terms/page.tsx`
- [ ] Deploy no Vercel
- [ ] Testar acessando `https://post-up-sandy.vercel.app/privacy`
- [ ] Testar acessando `https://post-up-sandy.vercel.app/terms`

---

### 1.2 - Atualizar Facebook App com URLs

**No Facebook Developers → Configurações → Básico:**

1. **URL da Política de Privacidade:**
```
https://post-up-sandy.vercel.app/privacy
```

2. **URL dos Termos de Serviço:**
```
https://post-up-sandy.vercel.app/terms
```

3. **Salve as alterações**

**✅ Checklist:**
- [ ] Privacy URL adicionada
- [ ] Terms URL adicionada
- [ ] URLs são públicas (não precisam de login)

---

### 1.3 - Preparar Vídeo Demo

**O que gravar:**
1. Login no PostUp
2. Ir em "Redes Sociais"
3. Clicar em "Conectar Facebook"
4. Autorizar permissões
5. Ver conta conectada
6. Criar uma arte no editor
7. Escrever legenda
8. Agendar post para Facebook
9. Aguardar publicação
10. Ver post no Facebook
11. Ver analytics no PostUp

**Ferramentas:**
- OBS Studio (grátis) - https://obsproject.com/
- Loom (grátis até 5min) - https://www.loom.com/
- ShareX (Windows, grátis) - https://getsharex.com/

**Requisitos:**
- Duração: 3-10 minutos
- Resolução: HD (1080p)
- Áudio: Opcional (pode ser mudo)
- Formato: MP4, MOV, AVI
- Upload: YouTube (unlisted) ou Vimeo

**✅ Checklist:**
- [ ] Vídeo gravado
- [ ] Vídeo enviado para YouTube/Vimeo
- [ ] Link público gerado
- [ ] Vídeo testado (abre sem login)

---

## PARTE 2: Verificação de Negócios

### 2.1 - Documentos Necessários

**Opção 1: Empresa (CNPJ)**
- ✅ Cartão CNPJ (emitido pela Receita Federal)
- ✅ Comprovante de endereço da empresa (conta de luz, água, telefone)
- ✅ Documento do representante legal (RG ou CNH)

**Opção 2: Pessoa Física (CPF)**
- ✅ RG ou CNH
- ✅ Comprovante de endereço no seu nome (conta de luz, água, telefone)
- ⚠️ Mais difícil aprovação, prefira CNPJ se possível

**Formato dos documentos:**
- PDF ou imagem (JPG, PNG)
- Máximo 5MB por arquivo
- Legível e sem rasuras

**✅ Checklist:**
- [ ] Documentos escaneados/fotografados
- [ ] Arquivos em formato aceito
- [ ] Informações visíveis e legíveis

---

### 2.2 - Criar Business Manager

**Se ainda não tem:**

1. Acesse: https://business.facebook.com/
2. Clique em "Criar conta"
3. Preencha:
   - Nome da empresa: "PostUp" ou seu CNPJ
   - Seu nome
   - Email de trabalho
4. Confirme email
5. Adicione método de pagamento (cartão de crédito - não será cobrado, só para verificação)

**✅ Checklist:**
- [ ] Business Manager criado
- [ ] Email confirmado
- [ ] Método de pagamento adicionado

---

### 2.3 - Vincular App ao Business Manager

**No Facebook Developers:**

1. Vá no seu app (ID: 1412807423815629)
2. Clique em "Configurações" → "Avançado"
3. Role até "Business Manager"
4. Clique em "Adicionar Business Manager"
5. Selecione seu Business Manager
6. Confirme

**✅ Checklist:**
- [ ] App vinculado ao Business Manager

---

### 2.4 - Iniciar Verificação de Negócios

**No Business Manager:**

1. Vá em **Configurações de segurança**
2. Clique em **Verificação de negócios**
3. Clique em "Iniciar verificação"
4. Escolha método:
   - **Recomendado:** Verificação por documento
5. Preencha informações:
   - **Nome legal da empresa:** (conforme CNPJ ou seu nome se CPF)
   - **Endereço:** (conforme comprovante)
   - **País:** Brasil
   - **Número de telefone:** Seu celular
6. Faça upload dos documentos:
   - **Documento de registro:** Cartão CNPJ ou RG/CNH
   - **Comprovante de endereço:** Conta recente (últimos 3 meses)
   - **Documento do representante:** RG ou CNH
7. Clique em "Enviar"

**✅ Checklist:**
- [ ] Todos os campos preenchidos
- [ ] Documentos enviados
- [ ] Verificação submetida

---

### 2.5 - Aguardar Análise

**Timeline:**
- ⏰ 1-5 dias úteis (normalmente 2-3 dias)
- 📧 Resposta via email e notificação no Business Manager

**Status possíveis:**
- ✅ **Aprovado:** Pronto! Pode solicitar App Review
- ❌ **Negado:** Veja o motivo e reenvie com correções
- ⏳ **Pendente:** Aguardando análise
- 📝 **Mais informações:** Facebook pediu documentos adicionais

**Se negado:**
1. Leia o motivo no email
2. Corrija o problema
3. Reenvie verificação

**✅ Checklist:**
- [ ] Aguardando resposta
- [ ] Email de confirmação recebido

---

## PARTE 3: App Review

### 3.1 - Pré-requisitos

**Antes de submeter, certifique-se:**
- [x] ✅ Verificação de negócios aprovada
- [x] ✅ Privacy Policy pública
- [x] ✅ Terms of Service público
- [x] ✅ Vídeo demo gravado e público
- [x] ✅ App funcionando 100%
- [x] ✅ OAuth testado como Admin

---

### 3.2 - Solicitar Permissões

**No Facebook Developers → Revisão do App → Permissões e recursos:**

Para cada permissão, clique em "Solicitar":

**1. pages_manage_posts**
- **Caso de uso:** "Gerenciamento de conteúdo de marketing"
- **Explicação detalhada:**
```
O PostUp permite que empresas criem conteúdo visual (artes, banners, posts) 
e agendem publicações automáticas em suas páginas do Facebook. Precisamos 
desta permissão para publicar o conteúdo criado pelo usuário em suas próprias 
páginas do Facebook no horário agendado.
```
- **Link do vídeo:** `https://youtu.be/SEU_VIDEO_ID`

**2. pages_read_engagement**
- **Caso de uso:** "Análise de engajamento"
- **Explicação detalhada:**
```
Precisamos exibir métricas de engajamento (curtidas, comentários, 
compartilhamentos, alcance) dos posts publicados pelo PostUp, para que o 
usuário possa avaliar o desempenho de suas campanhas de marketing.
```
- **Link do vídeo:** `https://youtu.be/SEU_VIDEO_ID`

**3. pages_show_list**
- **Caso de uso:** "Gerenciamento de páginas"
- **Explicação detalhada:**
```
Precisamos listar as páginas do Facebook que o usuário administra, para que 
ele possa escolher em qual página deseja publicar seu conteúdo.
```
- **Link do vídeo:** `https://youtu.be/SEU_VIDEO_ID`

**4. instagram_basic**
- **Caso de uso:** "Acesso básico ao Instagram"
- **Explicação detalhada:**
```
Precisamos acessar informações básicas da conta Instagram Business do usuário 
(nome, username, foto de perfil) para exibir na lista de contas conectadas.
```
- **Link do vídeo:** `https://youtu.be/SEU_VIDEO_ID`

**5. instagram_content_publish**
- **Caso de uso:** "Publicação no Instagram"
- **Explicação detalhada:**
```
O PostUp permite agendar publicações automáticas no Instagram Business. 
Precisamos desta permissão para publicar fotos e legendas criadas pelo usuário 
em sua conta do Instagram.
```
- **Link do vídeo:** `https://youtu.be/SEU_VIDEO_ID`

**6. business_management**
- **Caso de uso:** "Acesso ao Business Manager"
- **Explicação detalhada:**
```
Precisamos acessar as páginas e contas Instagram gerenciadas pelo Business 
Manager do usuário para permitir a conexão e publicação em múltiplas contas.
```
- **Link do vídeo:** `https://youtu.be/SEU_VIDEO_ID`

**✅ Checklist:**
- [ ] Todas as 6 permissões solicitadas
- [ ] Casos de uso preenchidos
- [ ] Explicações detalhadas fornecidas
- [ ] Vídeo demo vinculado em todas

---

### 3.3 - Preencher Informações do App Review

**No Facebook Developers → Revisão do App:**

1. **Instruções de teste:**
```
1. Faça login em https://post-up-sandy.vercel.app com:
   Email: teste@postup.com.br
   Senha: Teste123!

2. Vá em "Redes Sociais" no menu lateral

3. Clique em "Conectar Facebook"

4. Autorize todas as permissões solicitadas

5. Você verá suas páginas do Facebook e contas Instagram conectadas

6. Vá em "Editor" e crie uma arte simples

7. Após criar, clique em "Agendar Publicação"

8. Escolha a página conectada, escreva uma legenda e agende para daqui 1 minuto

9. Aguarde 1 minuto e verifique a publicação na sua página do Facebook

10. Volte ao PostUp e veja as métricas de engajamento do post
```

2. **Credenciais de teste** (se solicitar):
```
Email: teste@postup.com.br
Senha: Teste123!
```

3. **Notas adicionais:**
```
O app está em português brasileiro (pt-BR). 
Para testar completamente, você precisa ter uma página do Facebook 
e/ou conta Instagram Business conectada.
```

**✅ Checklist:**
- [ ] Instruções de teste detalhadas
- [ ] Credenciais fornecidas (se pediu)
- [ ] Notas adicionais incluídas

---

### 3.4 - Submeter para Revisão

1. Revise todas as informações
2. Clique em **"Enviar para revisão"**
3. Aguarde email de confirmação

**Timeline:**
- ⏰ 3-7 dias úteis
- 📧 Resposta via email

**Status possíveis:**
- ✅ **Aprovado:** App vai para modo Live
- ❌ **Negado:** Leia os motivos e corrija
- 📝 **Mais informações:** Facebook pediu esclarecimentos

**✅ Checklist:**
- [ ] App Review submetido
- [ ] Email de confirmação recebido

---

## PARTE 4: Após Aprovação

### 4.1 - Ativar Modo Live

**Quando aprovado:**

1. Vá em **Configurações → Básico**
2. No topo, mude de "Desenvolvimento" para **"Live"**
3. Confirme

**✅ Checklist:**
- [ ] App em modo Live
- [ ] Qualquer usuário pode conectar

---

### 4.2 - Testar com Usuário Real

**Crie nova conta de teste:**

1. Use email diferente (ex: `seunome+teste@gmail.com`)
2. Faça cadastro no PostUp
3. Conecte Facebook
4. Agende post
5. Verifique publicação

**✅ Checklist:**
- [ ] Novo usuário consegue conectar
- [ ] Posts são publicados
- [ ] Métricas aparecem

---

### 4.3 - Monitorar Tokens

**Tokens do Facebook expiram em 60 dias.**

**Crie job para renovar tokens:**

```typescript
// src/app/api/cron/refresh-tokens/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  
  // Busca tokens que vão expirar em 7 dias
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('platform', 'facebook')
    .lt('token_expires_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
  
  for (const account of accounts || []) {
    // Troca token antigo por novo de longa duração
    const response = await fetch(
      `https://graph.facebook.com/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${process.env.NEXT_PUBLIC_META_APP_ID}&` +
      `client_secret=${process.env.META_APP_SECRET}&` +
      `fb_exchange_token=${account.access_token}`
    )
    
    const data = await response.json()
    
    if (data.access_token) {
      await supabase
        .from('social_accounts')
        .update({
          access_token: data.access_token,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', account.id)
    }
  }
  
  return NextResponse.json({ success: true })
}
```

**Configure Vercel Cron:**

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/refresh-tokens",
    "schedule": "0 0 * * *"
  }]
}
```

**✅ Checklist:**
- [ ] Cron de refresh criado
- [ ] Testado manualmente
- [ ] Vercel Cron configurado

---

## 📋 Checklist Completo

### Preparação
- [ ] Criar página `/privacy`
- [ ] Criar página `/terms`
- [ ] Deploy no Vercel
- [ ] Atualizar URLs no Facebook App
- [ ] Gravar vídeo demo
- [ ] Upload vídeo para YouTube/Vimeo

### Verificação de Negócios
- [ ] Criar Business Manager
- [ ] Vincular app ao Business Manager
- [ ] Preparar documentos (CNPJ/CPF + comprovante)
- [ ] Submeter verificação
- [ ] Aguardar aprovação (1-5 dias)

### App Review
- [ ] Solicitar 6 permissões
- [ ] Preencher casos de uso
- [ ] Adicionar vídeo demo
- [ ] Escrever instruções de teste
- [ ] Submeter para revisão
- [ ] Aguardar aprovação (3-7 dias)

### Pós-Aprovação
- [ ] Ativar modo Live
- [ ] Testar com usuário real
- [ ] Configurar renovação de tokens
- [ ] Monitorar erros

---

## 🆘 Troubleshooting

**Verificação de negócios negada:**
- Verifique se documentos estão legíveis
- Confirme que nome/endereço batem
- Tente com CNPJ se usou CPF

**App Review negado:**
- Leia motivos no email
- Corrija problemas mencionados
- Grave novo vídeo se necessário
- Resubmeta

**Tokens expirando:**
- Configure cron job
- Monitore logs
- Avise usuários para reconectar se necessário

**Permissões não funcionam:**
- Confirme app está em modo Live
- Verifique se permissões foram aprovadas
- Teste revogar e reconectar conta

---

## ⏱️ Timeline Total Estimado

1. **Preparação:** 2-4 horas
2. **Verificação de Negócios:** 1-5 dias
3. **App Review:** 3-7 dias
4. **Testes pós-aprovação:** 1-2 horas

**Total:** ~7-14 dias + tempo de desenvolvimento

---

## 📞 Suporte

**Problemas técnicos:**
- Documentação Facebook: https://developers.facebook.com/docs
- Suporte Meta: https://developers.facebook.com/support

**Dúvidas sobre verificação:**
- Central de ajuda: https://www.facebook.com/business/help

---

**Última atualização:** Dezembro 2025
**Desenvolvedor:** Para uso interno de desenvolvimento
