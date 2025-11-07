-- Seed default locations (bus stops, metro and train stations)
-- Timestamp: 2025-10-24
-- Notes:
-- - Uses gen_random_uuid() from pgcrypto to generate string IDs (cast to text)
-- - Sets auditing timestamps to now()
-- - location_type is the JPA discriminator: 'BusStop', 'MetroStation' or 'Location'

-- =====================
-- Bus Stops (Pontos de Ônibus)
-- =====================
WITH l AS (
  INSERT INTO locations (
    id, name, address, latitude, longitude, type, description,
    created_at, updated_at, location_type, admin_id, organization_id
  ) VALUES (
    gen_random_uuid()::text,
    'Ponto Av. Paulista - Consolação',
    'Av. Paulista, 1000 - Bela Vista, São Paulo',
    -23.5613, -46.6565,
    'bus_stop', NULL,
    now(), now(), 'BusStop', NULL, NULL
  ) RETURNING id
)
INSERT INTO bus_stops (location_id, municipal_code, direction, has_shelter, has_bench)
SELECT id, 'SP-APL-1000', 'Centro-Bairro', TRUE, TRUE FROM l;

WITH l AS (
  INSERT INTO locations (
    id, name, address, latitude, longitude, type, description,
    created_at, updated_at, location_type, admin_id, organization_id
  ) VALUES (
    gen_random_uuid()::text,
    'Ponto Av. Faria Lima - Brigadeiro',
    'Av. Brigadeiro Faria Lima, 2000 - Jardim Paulistano, São Paulo',
    -23.5751, -46.6890,
    'bus_stop', NULL,
    now(), now(), 'BusStop', NULL, NULL
  ) RETURNING id
)
INSERT INTO bus_stops (location_id, municipal_code, direction, has_shelter, has_bench)
SELECT id, 'SP-AFL-2000', 'Bairro-Centro', FALSE, TRUE FROM l;

WITH l AS (
  INSERT INTO locations (
    id, name, address, latitude, longitude, type, description,
    created_at, updated_at, location_type, admin_id, organization_id
  ) VALUES (
    gen_random_uuid()::text,
    'Ponto Rua Augusta - Rua da Consolação',
    'Rua Augusta, 500 - Consolação, São Paulo',
    -23.5505, -46.6426,
    'bus_stop', NULL,
    now(), now(), 'BusStop', NULL, NULL
  ) RETURNING id
)
INSERT INTO bus_stops (location_id, municipal_code, direction, has_shelter, has_bench)
SELECT id, 'SP-RA-0500', 'Centro-Bairro', TRUE, FALSE FROM l;

-- =====================
-- Metro Stations (Estações de Metrô)
-- =====================
WITH l AS (
  INSERT INTO locations (
    id, name, address, latitude, longitude, type, description,
    created_at, updated_at, location_type, admin_id, organization_id
  ) VALUES (
    gen_random_uuid()::text,
    'Estação Sé',
    'Praça da Sé - Sé, São Paulo',
    -23.5505, -46.6333,
    'subway', NULL,
    now(), now(), 'MetroStation', NULL, NULL
  ) RETURNING id
)
INSERT INTO metro_stations (location_id, line, platform, has_accessibility, has_elevator, has_escalator)
SELECT id, 'Linha 3 - Vermelha', 'Central', TRUE, TRUE, TRUE FROM l;

WITH l AS (
  INSERT INTO locations (
    id, name, address, latitude, longitude, type, description,
    created_at, updated_at, location_type, admin_id, organization_id
  ) VALUES (
    gen_random_uuid()::text,
    'Estação Paulista',
    'Av. Paulista, 1374 - Bela Vista, São Paulo',
    -23.5567, -46.6610,
    'subway', NULL,
    now(), now(), 'MetroStation', NULL, NULL
  ) RETURNING id
)
INSERT INTO metro_stations (location_id, line, platform, has_accessibility, has_elevator, has_escalator)
SELECT id, 'Linha 4 - Amarela', 'Central', TRUE, TRUE, TRUE FROM l;

WITH l AS (
  INSERT INTO locations (
    id, name, address, latitude, longitude, type, description,
    created_at, updated_at, location_type, admin_id, organization_id
  ) VALUES (
    gen_random_uuid()::text,
    'Estação Vila Madalena',
    'Rua Fradique Coutinho, 1340 - Vila Madalena, São Paulo',
    -23.5464, -46.6909,
    'subway', NULL,
    now(), now(), 'MetroStation', NULL, NULL
  ) RETURNING id
)
INSERT INTO metro_stations (location_id, line, platform, has_accessibility, has_elevator, has_escalator)
SELECT id, 'Linha 2 - Verde', 'Central', TRUE, TRUE, TRUE FROM l;

WITH l AS (
  INSERT INTO locations (
    id, name, address, latitude, longitude, type, description,
    created_at, updated_at, location_type, admin_id, organization_id
  ) VALUES (
    gen_random_uuid()::text,
    'Estação República',
    'Praça da República - República, São Paulo',
    -23.5436, -46.6425,
    'subway', NULL,
    now(), now(), 'MetroStation', NULL, NULL
  ) RETURNING id
)
INSERT INTO metro_stations (location_id, line, platform, has_accessibility, has_elevator, has_escalator)
SELECT id, 'Linha 3 - Vermelha', 'Central', TRUE, TRUE, TRUE FROM l;

-- =====================
-- Train Stations (Estações da CPTM)
-- Note: Not modeled as a specific subclass; seeded as base Location with type = 'train'
-- =====================
INSERT INTO locations (
  id, name, address, latitude, longitude, type, description,
  created_at, updated_at, location_type, admin_id, organization_id
) VALUES (
  gen_random_uuid()::text,
  'Estação Luz',
  'Praça da Luz, 1 - Luz, São Paulo',
  -23.5344, -46.6356,
  'train', NULL,
  now(), now(), 'Location', NULL, NULL
);

INSERT INTO locations (
  id, name, address, latitude, longitude, type, description,
  created_at, updated_at, location_type, admin_id, organization_id
) VALUES (
  gen_random_uuid()::text,
  'Estação Brás',
  'Rua do Hipódromo, 1000 - Brás, São Paulo',
  -23.5254, -46.6186,
  'train', NULL,
  now(), now(), 'Location', NULL, NULL
);

INSERT INTO locations (
  id, name, address, latitude, longitude, type, description,
  created_at, updated_at, location_type, admin_id, organization_id
) VALUES (
  gen_random_uuid()::text,
  'Estação Tatuapé',
  'Rua Tuiuti, 2100 - Tatuapé, São Paulo',
  -23.5419, -46.5769,
  'train', NULL,
  now(), now(), 'Location', NULL, NULL
);
