-- Execute este script no SQL Editor do Supabase
-- Cria a tabela de segmentos dinâmicos

-- Tabela de segmentos
CREATE TABLE segments (
  id SERIAL PRIMARY KEY, -- ID sequencial automático
  name TEXT NOT NULL,
  icon TEXT NOT NULL, -- Emoji ou URL de imagem
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

-- Políticas (todos podem ver segmentos ativos, só admins podem gerenciar)
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

-- Trigger para atualizar updated_at
CREATE TRIGGER update_segments_updated_at
  BEFORE UPDATE ON segments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir segmentos padrão
INSERT INTO segments (name, icon, display_order) VALUES
  ('Alimentação', '🍽️', 1),
  ('Saúde', '⚕️', 2),
  ('Esporte', '🏋️', 3),
  ('Estética', '💅', 4),
  ('Beleza e bem estar', '🧘', 5),
  ('Advocacia', '⚖️', 6),
  ('Arquitetura', '🏗️', 7),
  ('Imóveis', '🏡', 8),
  ('Pet', '🐾', 9),
  ('Moda', '👗', 10);

-- Comentário
COMMENT ON TABLE segments IS 'Segmentos de mercado atendidos pela plataforma';
