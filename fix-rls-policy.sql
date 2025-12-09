-- Remover política antiga e criar nova com seu email
DROP POLICY IF EXISTS "Admins can manage templates" ON template_artes;

-- IMPORTANTE: Substitua 'SEU_EMAIL_AQUI@gmail.com' pelo email que você usa para logar no Supabase
CREATE POLICY "Admins can manage templates"
  ON template_artes
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'SEU_EMAIL_AQUI@gmail.com'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'SEU_EMAIL_AQUI@gmail.com'
  );

-- Verificar qual email está logado (execute este SELECT para ver seu email)
SELECT auth.jwt() ->> 'email' as meu_email;
