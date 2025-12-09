-- Execute este script no SQL Editor do Supabase
-- Adicionar campos de data na tabela subscriptions

-- Adicionar colunas de data se não existirem
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Atualizar registros existentes (30 dias a partir de agora)
UPDATE subscriptions 
SET 
  start_date = COALESCE(start_date, NOW()),
  end_date = COALESCE(end_date, NOW() + INTERVAL '30 days')
WHERE end_date IS NULL;

-- Criar função para calcular se assinatura está ativa
CREATE OR REPLACE FUNCTION is_subscription_active(sub_end_date TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN sub_end_date > NOW();
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON COLUMN subscriptions.start_date IS 'Data de início da assinatura';
COMMENT ON COLUMN subscriptions.end_date IS 'Data de expiração da assinatura';
