-- Tabela para armazenar templates de artes criados pelo admin
CREATE TABLE IF NOT EXISTS template_artes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'aniversario', 'promocao', 'vaga', 'dica', 'motivacional', 'basico'
  template_key VARCHAR(100) UNIQUE NOT NULL, -- chave única para identificar o template
  canvas_data JSONB NOT NULL, -- estrutura do canvas em JSON
  thumbnail_url TEXT, -- miniatura do template
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0, -- ordem de exibição
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_template_artes_category ON template_artes(category);
CREATE INDEX IF NOT EXISTS idx_template_artes_active ON template_artes(is_active);
CREATE INDEX IF NOT EXISTS idx_template_artes_order ON template_artes(display_order);

-- RLS Policies
ALTER TABLE template_artes ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ver templates ativos
CREATE POLICY "Anyone can view active templates"
  ON template_artes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Função para verificar se usuário é admin (você precisará adicionar uma coluna is_admin na tabela profiles)
-- Por enquanto, vamos usar o email como verificação temporária
CREATE POLICY "Admins can manage templates"
  ON template_artes
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      'seu-email-admin@gmail.com' -- SUBSTITUA pelo seu email
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'seu-email-admin@gmail.com' -- SUBSTITUA pelo seu email
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_template_artes_updated_at
  BEFORE UPDATE ON template_artes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE template_artes IS 'Templates de artes criados pelo admin para uso dos usuários';
COMMENT ON COLUMN template_artes.template_key IS 'Chave única para identificar o template (ex: birthday-party, black-friday)';
COMMENT ON COLUMN template_artes.canvas_data IS 'Dados do canvas em formato JSON (salvo pelo Fabric.js)';
