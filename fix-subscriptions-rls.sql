-- Execute este script no SQL Editor do Supabase
-- Corrigir políticas RLS da tabela subscriptions

-- 1. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON subscriptions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON subscriptions;

-- 2. Criar política de INSERT (permite criar subscription durante cadastro)
CREATE POLICY "Enable insert for authenticated users"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Criar política de SELECT (qualquer usuário autenticado pode ler)
CREATE POLICY "Enable read access for authenticated users"
  ON subscriptions FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. Criar política de UPDATE (usuário pode atualizar sua própria OU admin pode atualizar qualquer uma)
CREATE POLICY "Enable update for users and admins"
  ON subscriptions FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- 5. Criar política de DELETE (apenas admin pode deletar)
CREATE POLICY "Enable delete for admins"
  ON subscriptions FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );
