-- Execute este script no SQL Editor do Supabase
-- Cria o bucket de storage para logos de parceiros

-- Criar o bucket público
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Política de upload (apenas admins podem fazer upload)
CREATE POLICY "Admins can upload to public-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-assets' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Política de leitura (todos podem ver)
CREATE POLICY "Anyone can view public-assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public-assets');

-- Política de deleção (apenas admins podem deletar)
CREATE POLICY "Admins can delete from public-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'public-assets' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);
