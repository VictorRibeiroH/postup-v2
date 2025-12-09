-- Execute este script no SQL Editor do Supabase
-- Corrigir todas as políticas RLS da tabela profiles

-- 1. Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON profiles;

-- 2. Criar política simples de SELECT (sem recursão)
CREATE POLICY "Enable read access for authenticated users"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- 3. Política de INSERT (usuário pode criar seu próprio perfil)
CREATE POLICY "Enable insert for authenticated users"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Política de UPDATE (usuário pode atualizar seu próprio perfil OU admin pode atualizar qualquer perfil)
CREATE POLICY "Enable update for users and admins"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK (auth.uid() = id OR (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin');
