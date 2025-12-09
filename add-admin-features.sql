-- Execute este script no SQL Editor do Supabase
-- Adicionar tabelas para estatísticas, gestão de assinaturas e logs

-- 1. Tabela de histórico de assinaturas
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'created', 'extended', 'renewed', 'cancelled', 'expired'
  old_end_date TIMESTAMP WITH TIME ZONE,
  new_end_date TIMESTAMP WITH TIME ZONE,
  days_added INTEGER,
  performed_by UUID REFERENCES profiles(id), -- quem fez a ação (admin)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- quem fez a ação
  action TEXT NOT NULL, -- 'user_created', 'user_deleted', 'user_banned', 'plan_extended', 'plan_updated', etc
  entity_type TEXT, -- 'user', 'subscription', 'plan', 'partner', etc
  entity_id UUID, -- ID da entidade afetada
  details JSONB, -- detalhes adicionais da ação
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- 4. RLS Policies para subscription_history
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all subscription history"
  ON subscription_history FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

CREATE POLICY "Enable insert for authenticated users"
  ON subscription_history FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 5. RLS Policies para audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

CREATE POLICY "Enable insert for authenticated users"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 6. Função para registrar log de auditoria
CREATE OR REPLACE FUNCTION log_audit(
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger para registrar mudanças em subscriptions
CREATE OR REPLACE FUNCTION log_subscription_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO subscription_history (user_id, subscription_id, action, new_end_date)
    VALUES (NEW.user_id, NEW.id, 'created', NEW.end_date);
    
    PERFORM log_audit('subscription_created', 'subscription', NEW.id, 
      jsonb_build_object('user_id', NEW.user_id, 'plan_id', NEW.plan_id));
  
  ELSIF TG_OP = 'UPDATE' THEN
    -- Se end_date mudou
    IF OLD.end_date IS DISTINCT FROM NEW.end_date THEN
      INSERT INTO subscription_history (
        user_id, subscription_id, action, old_end_date, new_end_date,
        days_added, performed_by
      )
      VALUES (
        NEW.user_id, NEW.id, 'extended', OLD.end_date, NEW.end_date,
        EXTRACT(DAY FROM (NEW.end_date - OLD.end_date))::INTEGER,
        auth.uid()
      );
      
      PERFORM log_audit('subscription_extended', 'subscription', NEW.id,
        jsonb_build_object('old_end_date', OLD.end_date, 'new_end_date', NEW.end_date));
    END IF;
    
    -- Se status mudou
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO subscription_history (user_id, subscription_id, action, performed_by)
      VALUES (NEW.user_id, NEW.id, NEW.status, auth.uid());
      
      PERFORM log_audit('subscription_status_changed', 'subscription', NEW.id,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
    END IF;
  
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO subscription_history (user_id, subscription_id, action, performed_by)
    VALUES (OLD.user_id, OLD.id, 'deleted', auth.uid());
    
    PERFORM log_audit('subscription_deleted', 'subscription', OLD.id,
      jsonb_build_object('user_id', OLD.user_id));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar trigger
DROP TRIGGER IF EXISTS trigger_log_subscription_changes ON subscriptions;
CREATE TRIGGER trigger_log_subscription_changes
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_changes();

-- 9. Trigger para log de mudanças em profiles
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit('user_created', 'profile', NEW.id,
      jsonb_build_object('email', NEW.email, 'user_type', NEW.user_type));
  
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.user_type IS DISTINCT FROM NEW.user_type THEN
      PERFORM log_audit('user_type_changed', 'profile', NEW.id,
        jsonb_build_object('old_type', OLD.user_type, 'new_type', NEW.user_type));
    END IF;
  
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit('user_deleted', 'profile', OLD.id,
      jsonb_build_object('email', OLD.email));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_profile_changes ON profiles;
CREATE TRIGGER trigger_log_profile_changes
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_changes();

-- Comentários
COMMENT ON TABLE subscription_history IS 'Histórico de todas as mudanças em assinaturas';
COMMENT ON TABLE audit_logs IS 'Logs de auditoria de todas as ações importantes no sistema';
COMMENT ON FUNCTION log_audit IS 'Função helper para registrar logs de auditoria manualmente';
