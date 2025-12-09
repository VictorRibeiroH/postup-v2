-- SOLUÇÃO COMPLETA: Remove todas as políticas antigas e recria corretamente

-- 1. Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Users can view their own artes" ON public.artes;
DROP POLICY IF EXISTS "Users can insert their own artes" ON public.artes;
DROP POLICY IF EXISTS "Users can update their own artes" ON public.artes;
DROP POLICY IF EXISTS "Users can delete their own artes" ON public.artes;

-- 2. Recriar políticas com especificação correta TO authenticated
CREATE POLICY "Users can view their own artes"
  ON public.artes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own artes"
  ON public.artes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own artes"
  ON public.artes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own artes"
  ON public.artes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Verificar se as políticas foram criadas corretamente
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
WHERE tablename = 'artes'
ORDER BY policyname;
