-- Temporariamente, vamos permitir insert autenticado sem verificar o user_id
-- para debug. REMOVER depois!

DROP POLICY IF EXISTS "Users can insert their own artes" ON public.artes;

CREATE POLICY "Users can insert their own artes"
  ON public.artes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verificar se funcionou
SELECT * FROM pg_policies WHERE tablename = 'artes' AND cmd = 'INSERT';
