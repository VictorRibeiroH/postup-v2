-- Verificar se o usuário tem permissão
SELECT auth.uid() as current_user_id;

-- Testar insert (substitua 'SEU_USER_ID' pelo ID retornado acima)
INSERT INTO public.artes (user_id, title, image_url, canvas_data, width, height)
VALUES (
  auth.uid(),
  'Teste',
  'https://example.com/test.png',
  '{"version":"5.3.0","objects":[]}'::jsonb,
  1080,
  1080
);

-- Se der erro, verificar as policies em detalhe
SELECT * FROM pg_policies WHERE tablename = 'artes';
