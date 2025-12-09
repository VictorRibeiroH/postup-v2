-- Configurar CORS para o bucket public-assets
-- Isso permite que o canvas exporte imagens carregadas do Storage

-- Atualizar configuração CORS do bucket
UPDATE storage.buckets
SET cors = '[
  {
    "allowedOrigins": ["*"],
    "allowedMethods": ["GET", "HEAD"],
    "allowedHeaders": ["*"],
    "exposedHeaders": [],
    "maxAgeSeconds": 3600
  }
]'::jsonb
WHERE id = 'public-assets';

-- Verificar a configuração
SELECT id, name, public, cors 
FROM storage.buckets 
WHERE id = 'public-assets';
