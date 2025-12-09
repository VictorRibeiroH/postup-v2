# 🔄 Guia de Migração - Vercel para Domínio Customizado

## Checklist de Migração

### ANTES da Migração (estado atual)
- ✅ App funcionando em: `post-up-sandy.vercel.app`
- ✅ Facebook configurado com URIs temporários
- ✅ Tudo testado e funcionando

### DEPOIS da Migração (estado final)
- ✅ App funcionando em: `seudominio.com.br`
- ✅ Facebook atualizado com novos URIs
- ✅ Variáveis de ambiente atualizadas
- ✅ DNS configurado

---

## PASSO 1: Cliente Compra o Domínio

**Cliente deve:**
1. Comprar domínio (ex: `postup.com.br`)
2. Ter acesso ao painel de DNS (Registro.br, GoDaddy, etc)
3. Fornecer acesso ou instruções ao desenvolvedor

---

## PASSO 2: Adicionar Domínio no Vercel

**No projeto Vercel:**

1. Acesse: https://vercel.com/seu-projeto
2. Vá em **Settings → Domains**
3. Clique em **"Add Domain"**
4. Digite: `postup.com.br`
5. Digite também: `www.postup.com.br`
6. Vercel vai mostrar as configurações de DNS necessárias

---

## PASSO 3: Configurar DNS

**No painel de DNS do domínio (Registro.br, GoDaddy, etc):**

**Para domínio raiz (`postup.com.br`):**
```
Tipo: A
Nome: @
Valor: 76.76.21.21 (IP do Vercel)
TTL: 3600
```

**Para www (`www.postup.com.br`):**
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
TTL: 3600
```

⏰ **Aguarde propagação:** 5 minutos a 48 horas

---

## PASSO 4: Atualizar Variáveis de Ambiente

**No Vercel → Settings → Environment Variables:**

Atualize:
```env
NEXT_PUBLIC_META_REDIRECT_URI=https://postup.com.br/api/oauth/meta/callback
```

**Depois, faça um novo deploy:**
- Vercel → Deployments → Redeploy

---

## PASSO 5: Atualizar Facebook App

**No Facebook Developers:**

1. Vá em **Configurações → Básico**
2. Atualize **"Domínios do App":**
   - Adicione: `postup.com.br`
   - Remova: `post-up-sandy.vercel.app` (opcional)

3. Vá em **Produtos → Login do Facebook → Configurações**
4. Atualize **"URIs de redirecionamento do OAuth válidos":**
```
https://postup.com.br/api/oauth/meta/callback
https://www.postup.com.br/api/oauth/meta/callback
```

5. Salve as alterações

---

## PASSO 6: Atualizar URLs nas Páginas Obrigatórias

**No Facebook App → Configurações → Básico:**

Atualize:
- **URL da Política de Privacidade:** `https://postup.com.br/privacy`
- **URL dos Termos de Serviço:** `https://postup.com.br/terms`

---

## PASSO 7: Testar

**Checklist de testes:**

1. ✅ Acesse `https://postup.com.br`
2. ✅ Faça login no sistema
3. ✅ Vá em "Redes Sociais"
4. ✅ Clique em "Conectar Facebook"
5. ✅ Autorize as permissões
6. ✅ Verifique se conectou com sucesso
7. ✅ Teste criar e agendar um post
8. ✅ Verifique se o post foi publicado

---

## PASSO 8: Certificado SSL

**Automático no Vercel:**
- ✅ Vercel gera SSL automaticamente
- ✅ Força HTTPS
- ✅ Renova automaticamente

**Verifique:**
- Acesse: `https://postup.com.br`
- Veja o cadeado 🔒 no navegador

---

## 🔄 Rollback (se algo der errado)

**Se houver problemas:**

1. No Facebook, volte os URIs para:
```
https://post-up-sandy.vercel.app/api/oauth/meta/callback
```

2. No Vercel, volte a variável:
```env
NEXT_PUBLIC_META_REDIRECT_URI=https://post-up-sandy.vercel.app/api/oauth/meta/callback
```

3. Faça novo deploy

---

## 📋 Checklist Final

Antes de considerar a migração completa:

- [ ] Domínio carrega o site corretamente
- [ ] SSL/HTTPS funcionando (cadeado verde)
- [ ] Login de usuários funciona
- [ ] Conexão com Facebook funciona
- [ ] Agendamento de posts funciona
- [ ] Editor de artes funciona
- [ ] Dashboard carrega corretamente
- [ ] Emails transacionais funcionam (se houver)

---

## ⏱️ Timeline Estimado

1. **Compra do domínio:** Imediato
2. **Adicionar no Vercel:** 5 minutos
3. **Configurar DNS:** 5 minutos
4. **Propagação DNS:** 5 min - 48h (geralmente < 1h)
5. **Atualizar Facebook:** 10 minutos
6. **Testes completos:** 30 minutos

**Total:** ~1 hora (+ tempo de propagação DNS)

---

## 🆘 Troubleshooting

**Problema:** DNS não propaga
- Solução: Aguarde até 48h, verifique configurações no painel DNS

**Problema:** SSL não ativa
- Solução: Remova e adicione domínio novamente no Vercel

**Problema:** Redirect do Facebook falha
- Solução: Verifique se o URI no Facebook está EXATAMENTE igual ao configurado

**Problema:** "Unauthorized" no OAuth
- Solução: Confirme que as variáveis de ambiente foram atualizadas e deploy foi feito

---

**Desenvolvedor:** Para dúvidas técnicas, contacte o responsável pelo projeto
**Cliente:** Guarde este documento para futuras referências

**Última atualização:** Dezembro 2025
