-- Opção 1: Adicionar coluna is_admin na tabela auth.users (metadata)
-- Esta é a maneira mais simples usando user_metadata

-- Primeiro, remova as políticas antigas
DROP POLICY IF EXISTS "Admins can manage templates" ON template_artes;
DROP POLICY IF EXISTS "Anyone can view active templates" ON template_artes;

-- Política para visualizar templates ativos
CREATE POLICY "Anyone can view active templates"
  ON template_artes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Política para admins gerenciarem templates
-- Verifica se o usuário tem is_admin = true no user_metadata
CREATE POLICY "Admins can manage templates"
  ON template_artes
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- ============================================
-- DEPOIS DE EXECUTAR O SQL ACIMA, você precisa:
-- 1. Ir no Supabase Dashboard > Authentication > Users
-- 2. Clicar no usuário que deve ser admin
-- 3. Ir na aba "User Metadata"
-- 4. Adicionar: { "is_admin": true }
-- ============================================

-- OU execute este SQL para tornar um usuário específico admin:
-- UPDATE auth.users 
-- SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
-- WHERE email = 'seu-email@gmail.com';
