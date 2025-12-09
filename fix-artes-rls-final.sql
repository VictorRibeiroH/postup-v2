-- Solução definitiva: usar authenticated role ao invés de auth.uid()
-- Isso funciona melhor com SSR do Next.js

DROP POLICY IF EXISTS "Users can insert their own artes" ON public.artes;
DROP POLICY IF EXISTS "Users can view their own artes" ON public.artes;
DROP POLICY IF EXISTS "Users can update their own artes" ON public.artes;
DROP POLICY IF EXISTS "Users can delete their own artes" ON public.artes;

-- SELECT: Usuários veem apenas suas próprias artes
CREATE POLICY "Users can view their own artes"
  ON public.artes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: Permite insert e garante que user_id seja o correto
CREATE POLICY "Users can insert their own artes"
  ON public.artes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Usuários podem atualizar apenas suas próprias artes
CREATE POLICY "Users can update their own artes"
  ON public.artes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Usuários podem deletar apenas suas próprias artes
CREATE POLICY "Users can delete their own artes"
  ON public.artes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Verificar as policies criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'artes';
