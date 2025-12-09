-- Verificar todas as constraints da tabela artes
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  CASE con.contype
    WHEN 'c' THEN 'CHECK'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 't' THEN 'TRIGGER'
    ELSE con.contype::text
  END AS constraint_type_desc,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'artes'
  AND nsp.nspname = 'public';

-- Verificar triggers
SELECT 
  tgname AS trigger_name,
  tgenabled AS enabled,
  pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgrelid = 'public.artes'::regclass
  AND tgisinternal = false;

-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'artes';

-- Tentar um INSERT direto como teste (vai falhar, mas mostra o erro)
-- Comente esta linha se quiser apenas ver as constraints
-- INSERT INTO public.artes (user_id, title, image_url, canvas_data, width, height)
-- VALUES (auth.uid(), 'Teste Direto', 'https://test.com/image.png', '{"test": true}'::jsonb, 1080, 1080);
