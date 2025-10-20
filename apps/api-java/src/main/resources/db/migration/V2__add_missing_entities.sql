-- tickets-transporte-publico/apps/api-java/src/main/resources/db/migration/V2__add_missing_entities.sql

-- Tabela de Organizações
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    main_contact VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_org_cnpj ON organizations(cnpj);
CREATE INDEX idx_org_name ON organizations(name);

-- Adicionar organization_id em users
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id VARCHAR(36);
ALTER TABLE users ADD CONSTRAINT fk_user_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Adicionar organization_id em locations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS organization_id VARCHAR(36);
ALTER TABLE locations ADD CONSTRAINT fk_location_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Adicionar discriminador de tipo em locations para herança
ALTER TABLE locations ADD COLUMN IF NOT EXISTS location_type VARCHAR(50) DEFAULT 'GENERIC';

-- Tabela de Pontos de Ônibus (herança JOINED)
CREATE TABLE IF NOT EXISTS bus_stops (
    location_id VARCHAR(36) PRIMARY KEY,
    municipal_code VARCHAR(50) UNIQUE,
    direction VARCHAR(100) NOT NULL,
    has_shelter BOOLEAN DEFAULT FALSE,
    has_bench BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Tabela de Estações de Metrô (herança JOINED)
CREATE TABLE IF NOT EXISTS metro_stations (
    location_id VARCHAR(36) PRIMARY KEY,
    line VARCHAR(100) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    has_accessibility BOOLEAN DEFAULT FALSE NOT NULL,
    has_elevator BOOLEAN DEFAULT FALSE,
    has_escalator BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Tabela de Evidências
CREATE TABLE IF NOT EXISTS evidences (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    url TEXT NOT NULL,
    size_kb INTEGER,
    original_filename VARCHAR(255),
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    report_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

CREATE INDEX idx_evidence_report ON evidences(report_id);
CREATE INDEX idx_evidence_type ON evidences(type);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    channel VARCHAR(20) NOT NULL,
    metadata TEXT,
    user_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_user ON notifications(user_id);
CREATE INDEX idx_notification_read ON notifications(is_read);
CREATE INDEX idx_notification_sent ON notifications(sent_at);