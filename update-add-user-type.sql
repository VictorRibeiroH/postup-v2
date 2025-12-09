-- Execute este script no SQL Editor do Supabase para atualizar o banco

-- Opção 1: Se você quer MANTER os dados existentes
-- Adiciona a coluna user_type na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user' 
CHECK (user_type IN ('user', 'admin'));

-- Opção 2: Se você quer RECOMEÇAR do ZERO (perde todos os dados)
-- Descomente as linhas abaixo:

/*
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Depois execute o supabase-schema.sql completo
*/
