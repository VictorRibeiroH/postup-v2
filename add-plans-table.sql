-- Execute este script no SQL Editor do Supabase
-- Cria a tabela de planos dinâmicos

-- Tabela de planos
CREATE TABLE plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id TEXT UNIQUE NOT NULL, -- ID único do plano (ex: 'start', 'pro')
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  artes_limit INTEGER NOT NULL DEFAULT 4,
  has_ads BOOLEAN DEFAULT false,
  has_dashboard BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  popular_badge TEXT, -- Ex: "MAIS POPULAR"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de features dos planos
CREATE TABLE plan_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  feature_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- Políticas para plans (todos podem ler planos ativos, só admins podem gerenciar)
CREATE POLICY "Everyone can view active plans"
  ON plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all plans"
  ON plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can insert plans"
  ON plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can update plans"
  ON plans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can delete plans"
  ON plans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Políticas para plan_features
CREATE POLICY "Everyone can view plan features"
  ON plan_features FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage plan features"
  ON plan_features FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Triggers para atualizar updated_at
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir planos padrão
INSERT INTO plans (plan_id, name, price, description, artes_limit, has_ads, has_dashboard, display_order, is_popular, popular_badge) VALUES
  ('start', 'START', 100.00, 'Ideal para quem está começando! Gestão de conteúdo com 4 artes personalizáveis para dar o pontapé inicial na sua presença online.', 4, false, false, 1, false, NULL),
  ('growth', 'GROWTH', 180.00, 'Perfeito para quem busca expandir! Gestão de conteúdo com 8 artes personalizáveis para um crescimento consistente e engajamento da sua audiência.', 8, false, false, 2, false, NULL),
  ('pro', 'PRO', 249.00, 'Nosso plano mais popular! Gestão de conteúdo com 12 artes personalizáveis, ideal para negócios que buscam alta frequência e impacto nas redes sociais.', 12, false, false, 3, true, 'MAIS POPULAR'),
  ('business', 'BUSINESS', 250.00, 'Gestão de conteúdo com 4 artes + anúncios', 4, true, false, 4, false, NULL),
  ('enterprise', 'ENTERPRISE', 500.00, 'Plano completo com todos os recursos! Dashboard exclusivo, gestão de anúncios avançada, 12 artes personalizáveis e suporte prioritário.', 12, true, true, 5, false, NULL);

-- Inserir features para cada plano
-- START
INSERT INTO plan_features (plan_id, feature_text, display_order)
SELECT id, '4 artes personalizáveis', 1 FROM plans WHERE plan_id = 'start'
UNION ALL
SELECT id, 'Gestão de conteúdo básica', 2 FROM plans WHERE plan_id = 'start';

-- GROWTH
INSERT INTO plan_features (plan_id, feature_text, display_order)
SELECT id, '8 artes personalizáveis', 1 FROM plans WHERE plan_id = 'growth'
UNION ALL
SELECT id, 'Gestão de conteúdo avançada', 2 FROM plans WHERE plan_id = 'growth';

-- PRO
INSERT INTO plan_features (plan_id, feature_text, display_order)
SELECT id, '12 artes personalizáveis', 1 FROM plans WHERE plan_id = 'pro'
UNION ALL
SELECT id, 'Gestão de conteúdo completa', 2 FROM plans WHERE plan_id = 'pro';

-- BUSINESS
INSERT INTO plan_features (plan_id, feature_text, display_order)
SELECT id, '4 artes personalizáveis', 1 FROM plans WHERE plan_id = 'business'
UNION ALL
SELECT id, 'Gestão de anúncios', 2 FROM plans WHERE plan_id = 'business'
UNION ALL
SELECT id, 'Relatórios básicos', 3 FROM plans WHERE plan_id = 'business';

-- ENTERPRISE
INSERT INTO plan_features (plan_id, feature_text, display_order)
SELECT id, '12 artes personalizáveis', 1 FROM plans WHERE plan_id = 'enterprise'
UNION ALL
SELECT id, 'Gestão de anúncios avançada', 2 FROM plans WHERE plan_id = 'enterprise'
UNION ALL
SELECT id, 'Dashboard completo', 3 FROM plans WHERE plan_id = 'enterprise'
UNION ALL
SELECT id, 'Suporte prioritário', 4 FROM plans WHERE plan_id = 'enterprise';

-- Comentários
COMMENT ON TABLE plans IS 'Planos de assinatura configuráveis';
COMMENT ON TABLE plan_features IS 'Features/características de cada plano';
