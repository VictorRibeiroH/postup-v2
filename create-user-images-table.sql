-- Tabela para armazenar imagens dos usuários (logos, fotos, etc)
CREATE TABLE IF NOT EXISTS public.user_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_images ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own images"
  ON public.user_images FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own images"
  ON public.user_images FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own images"
  ON public.user_images FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON public.user_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_images_created_at ON public.user_images(created_at DESC);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_images_updated_at
  BEFORE UPDATE ON public.user_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
