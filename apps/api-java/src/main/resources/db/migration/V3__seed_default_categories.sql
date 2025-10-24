-- Seed default categories
-- Timestamp: 2025-10-24
-- Notes:
-- - Uses gen_random_uuid() from pgcrypto to generate IDs (text)
-- - Sets auditing timestamps to now()
-- - Category types must match enum: RAMP, TACTILE_FLOOR, ELEVATOR, SIGNAGE, ACCESSIBILITY, INFRASTRUCTURE, OTHER

-- Ensure pgcrypto is available (no-op if already exists)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper CTE to upsert-like by unique name using ON CONFLICT DO NOTHING
INSERT INTO categories (id, name, type, description, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, 'Rampa de Acesso', 'RAMP', 'Problemas com rampas para cadeirantes', now(), now()),
  (gen_random_uuid()::text, 'Piso Tátil', 'TACTILE_FLOOR', 'Ausência ou problemas no piso tátil para deficientes visuais', now(), now()),
  (gen_random_uuid()::text, 'Elevador', 'ELEVATOR', 'Elevadores quebrados ou inacessíveis', now(), now()),
  (gen_random_uuid()::text, 'Sinalização', 'SIGNAGE', 'Falta de sinalização adequada (inclui braile)', now(), now()),
  (gen_random_uuid()::text, 'Acessibilidade Geral', 'ACCESSIBILITY', 'Recursos gerais de acessibilidade indisponíveis', now(), now()),
  (gen_random_uuid()::text, 'Infraestrutura', 'INFRASTRUCTURE', 'Problemas de infraestrutura física', now(), now()),
  (gen_random_uuid()::text, 'Outros', 'OTHER', 'Outros problemas não categorizados', now(), now())
ON CONFLICT (name) DO NOTHING;
