-- Verificar se a tabela artes existe e está configurada corretamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'artes'
ORDER BY ordinal_position;

-- Verificar as políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'artes';

-- Se a tabela não existir, crie-a
CREATE TABLE IF NOT EXISTS public.artes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  canvas_data JSONB,
  width INTEGER DEFAULT 1080,
  height INTEGER DEFAULT 1080,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir que RLS está ativado
ALTER TABLE public.artes ENABLE ROW LEVEL SECURITY;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_artes_user_id ON public.artes(user_id);
CREATE INDEX IF NOT EXISTS idx_artes_created_at ON public.artes(created_at DESC);
