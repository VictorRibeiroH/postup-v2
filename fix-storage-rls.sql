-- SOLUÇÃO: Políticas RLS para o Storage bucket public-assets

-- 1. Permitir que usuários autenticados façam UPLOAD (INSERT)
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Permitir que TODOS possam fazer SELECT (visualizar arquivos públicos)
CREATE POLICY "Public files are accessible to everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public-assets');

-- 3. Permitir que usuários autenticados atualizem seus próprios arquivos
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'public-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'public-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Permitir que usuários autenticados deletem seus próprios arquivos
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'public-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Verificar as políticas criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;
