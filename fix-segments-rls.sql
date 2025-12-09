-- Execute este script no SQL Editor do Supabase para corrigir as políticas de RLS

-- Remover políticas antigas
DROP POLICY IF EXISTS "Everyone can view active segments" ON segments;
DROP POLICY IF EXISTS "Admins can view all segments" ON segments;
DROP POLICY IF EXISTS "Only admins can insert segments" ON segments;
DROP POLICY IF EXISTS "Only admins can update segments" ON segments;
DROP POLICY IF EXISTS "Only admins can delete segments" ON segments;

-- Criar políticas corretas
CREATE POLICY "Everyone can view segments"
  ON segments FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert segments"
  ON segments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can update segments"
  ON segments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can delete segments"
  ON segments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );
