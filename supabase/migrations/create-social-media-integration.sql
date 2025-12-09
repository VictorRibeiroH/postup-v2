-- Limpar tabelas anteriores se existirem
DROP TABLE IF EXISTS post_analytics CASCADE;
DROP TABLE IF EXISTS scheduled_posts CASCADE;
DROP TABLE IF EXISTS social_accounts CASCADE;

-- Tabela de contas de redes sociais vinculadas (cada usuário vincula suas próprias contas)
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram')),
  account_id TEXT NOT NULL, -- ID da conta/página na Meta
  account_name TEXT NOT NULL, -- Nome da página/perfil
  account_username TEXT, -- @username do Instagram
  account_picture TEXT, -- URL da foto de perfil
  access_token TEXT NOT NULL, -- Token de acesso OAuth do usuário
  token_expires_at TIMESTAMPTZ, -- Quando o token expira (60 dias)
  is_active BOOLEAN DEFAULT true,
  page_category TEXT, -- Categoria da página (Facebook)
  followers_count INTEGER DEFAULT 0, -- Número de seguidores
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, account_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_active ON social_accounts(is_active);

-- Tabela de posts agendados (cada usuário agenda posts para suas próprias contas)
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arte_id UUID REFERENCES artes(id) ON DELETE SET NULL, -- Arte criada no editor
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Legenda do post
  media_urls JSONB DEFAULT '[]'::jsonb, -- URLs das imagens/vídeos
  platforms JSONB NOT NULL DEFAULT '[]'::jsonb, -- ['facebook', 'instagram'] - onde publicar
  social_account_ids JSONB NOT NULL DEFAULT '[]'::jsonb, -- IDs das contas específicas
  scheduled_for TIMESTAMPTZ NOT NULL, -- Data/hora para publicar
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed', 'cancelled')),
  publish_results JSONB DEFAULT '{}'::jsonb, -- {facebook: {success: true, post_id: '123'}, instagram: {...}}
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_arte_id ON scheduled_posts(arte_id);

-- Tabela de histórico de publicações
CREATE TABLE IF NOT EXISTS post_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_post_id TEXT, -- ID do post na plataforma
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_post_analytics_scheduled_post_id ON post_analytics(scheduled_post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_platform ON post_analytics(platform);

-- RLS Policies
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Social Accounts Policies
CREATE POLICY "Users can view their own social accounts"
  ON social_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social accounts"
  ON social_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social accounts"
  ON social_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social accounts"
  ON social_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Scheduled Posts Policies
CREATE POLICY "Users can view their own scheduled posts"
  ON scheduled_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled posts"
  ON scheduled_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts"
  ON scheduled_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts"
  ON scheduled_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Post Analytics Policies
CREATE POLICY "Users can view analytics of their posts"
  ON post_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scheduled_posts
      WHERE scheduled_posts.id = post_analytics.scheduled_post_id
      AND scheduled_posts.user_id = auth.uid()
    )
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE social_accounts IS 'Contas de redes sociais vinculadas pelos usuários';
COMMENT ON TABLE scheduled_posts IS 'Posts agendados para publicação nas redes sociais';
COMMENT ON TABLE post_analytics IS 'Métricas e analytics dos posts publicados';
