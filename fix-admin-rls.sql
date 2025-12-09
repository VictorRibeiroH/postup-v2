-- Solução definitiva: usar raw_app_metadata que funciona melhor com RLS

-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins can manage templates" ON template_artes;
DROP POLICY IF EXISTS "Anyone can view active templates" ON template_artes;

-- Política para visualizar templates ativos (qualquer usuário autenticado)
CREATE POLICY "Anyone can view active templates"
  ON template_artes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Política para admins - usando raw_app_metadata
CREATE POLICY "Admins can manage templates"
  ON template_artes
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
  )
  WITH CHECK (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
  );

-- Tornar seu usuário admin (substitua o email)
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
WHERE email = 'seu-email@gmail.com';

-- Verificar se funcionou
SELECT id, email, raw_app_meta_data->'is_admin' as is_admin 
FROM auth.users 
WHERE email = 'seu-email@gmail.com';
