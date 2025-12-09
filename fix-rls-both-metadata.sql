-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins can manage templates" ON template_artes;
DROP POLICY IF EXISTS "Anyone can view active templates" ON template_artes;

-- Política para visualizar templates ativos
CREATE POLICY "Anyone can view active templates"
  ON template_artes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Política para admins - verifica AMBOS user_metadata E app_metadata
CREATE POLICY "Admins can manage templates"
  ON template_artes
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean,
      (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean,
      false
    ) = true
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean,
      (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean,
      false
    ) = true
  );

-- Para o usuário contato.victoribeiro@gmail.com
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
WHERE email = 'contato.victoribeiro@gmail.com';

-- Verificar
SELECT 
  email,
  raw_user_meta_data->'is_admin' as user_meta_admin,
  raw_app_meta_data->'is_admin' as app_meta_admin
FROM auth.users 
WHERE email = 'contato.victoribeiro@gmail.com';
