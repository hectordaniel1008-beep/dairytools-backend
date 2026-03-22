-- ============================================================
--  DairyTools — PostgreSQL
--  Ejecutar una vez para crear las tablas y datos iniciales
--  psql -U postgres -d dairytools -f database/init.sql
-- ============================================================

-- Crear base de datos si no existe (ejecutar como superuser antes)
-- CREATE DATABASE dairytools;

-- ── Empresas ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS empresas (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(150) NOT NULL,
  clave      VARCHAR(20)  NOT NULL UNIQUE,
  color      VARCHAR(10)  DEFAULT '#1e5a96',
  logo_url   VARCHAR(255),
  estatus    BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

INSERT INTO empresas (nombre, clave, color) VALUES
  ('Rancho El Fresno',        'REF-001', '#1e5a96'),
  ('Agropecuaria del Norte',  'ADN-002', '#2da44e'),
  ('Ganadería La Esperanza',  'GLE-003', '#7c3aed')
ON CONFLICT (clave) DO NOTHING;

-- ── Usuarios ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id                  SERIAL PRIMARY KEY,
  nombre              VARCHAR(100) NOT NULL,
  email               VARCHAR(150) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  es_superadmin       BOOLEAN      DEFAULT false,
  empresa_default_id  INT          REFERENCES empresas(id) ON DELETE SET NULL,
  estatus             BOOLEAN      DEFAULT true,
  ultimo_acceso       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- Contraseñas: admin123 / super123 / oper123 (bcrypt cost 12)
INSERT INTO usuarios (nombre, email, password_hash, es_superadmin, empresa_default_id) VALUES
  ('Administrador',  'admin@dairytools.com',
   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   true, 1),
  ('María García',   'supervisor@dairytools.com',
   '$2b$12$gUqSReNKVzBQdoGqnNS1M.7V3DvlNKDBMFlBhwW2oHiSomjDFdQ7q',
   false, 1),
  ('Juan López',     'operador@dairytools.com',
   '$2b$12$tW5BQpTH4X/RkXUk5ELqT.YQu0K7KKZ0o3J6sF9m3tMJQiXP2oFce',
   false, 1)
ON CONFLICT (email) DO NOTHING;

-- ── Relación Usuario ↔ Empresa ────────────────────────────────
CREATE TABLE IF NOT EXISTS usuario_empresa (
  id         SERIAL PRIMARY KEY,
  usuario_id INT  NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  empresa_id INT  NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  rol        VARCHAR(20) DEFAULT 'operador' CHECK (rol IN ('admin','supervisor','operador')),
  estatus    BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (usuario_id, empresa_id)
);

-- Admin → las 3 empresas
INSERT INTO usuario_empresa (usuario_id, empresa_id, rol) VALUES
  (1,1,'admin'),(1,2,'admin'),(1,3,'admin'),
  (2,1,'supervisor'),(2,2,'operador'),
  (3,1,'operador')
ON CONFLICT (usuario_id, empresa_id) DO NOTHING;

-- ── Refresh Tokens ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  usuario_id INT          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token      VARCHAR(128) NOT NULL UNIQUE,
  expira_en  TIMESTAMPTZ  NOT NULL,
  creado_en  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_token  ON refresh_tokens (token);
CREATE INDEX IF NOT EXISTS idx_refresh_usuario ON refresh_tokens (usuario_id);