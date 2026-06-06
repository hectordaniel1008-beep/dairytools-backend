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
  estatus    BOOLEAN      DEFAULT true,
  color      VARCHAR(10)  DEFAULT '#1e5a96',
  logo_url   VARCHAR(255),
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  rfc        VARCHAR(13)
);

INSERT INTO empresas (nombre, clave, color, estatus, rfc) VALUES
  ('Rancho El Fresno',        'REF-001', '#1e5a96', true, 'AAA010101AAA' ),
  ('Agropecuaria del Norte',  'ADN-002', '#2da44e', true, 'AAA010101AAA' ),
  ('Ganadería La Esperanza',  'GLE-003', '#7c3aed', true, 'AAA010101AAA' )
ON CONFLICT (clave) DO NOTHING;

-- ── Usuarios ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id                  SERIAL PRIMARY KEY,
  nombre              VARCHAR(100) NOT NULL,
  email               VARCHAR(150) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  es_superadmin       BOOLEAN      DEFAULT false,
  estatus             BOOLEAN      DEFAULT true,
  ultimo_acceso       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- Contraseñas: admin123 / super123 / oper123 (bcrypt cost 12)
INSERT INTO usuarios (nombre, email, password_hash, es_superadmin) VALUES
  ('Administrador',  'admin@dairytools.com',
   '$2b$10$HQKK6W7jreKlJl2JLYdOXOjuqrKRPIU3l2TqNXgcaO1srkT8M0AC2',
   true),
  ('María García',   'supervisor@dairytools.com',
   '$2b$12$gUqSReNKVzBQdoGqnNS1M.7V3DvlNKDBMFlBhwW2oHiSomjDFdQ7q',
   false),
  ('Juan López',     'operador@dairytools.com',
   '$2b$12$tW5BQpTH4X/RkXUk5ELqT.YQu0K7KKZ0o3J6sF9m3tMJQiXP2oFce',
   false)
ON CONFLICT (email) DO NOTHING;

-- ── Relación Usuario ↔ Empresa ────────────────────────────────
CREATE TABLE IF NOT EXISTS usuario_empresa (
  id         SERIAL PRIMARY KEY,
  usuario_id INT  NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  empresa_id INT  NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  estatus    BOOLEAN      DEFAULT true,
  rol        VARCHAR(20)  DEFAULT 'operador',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  es_default BOOLEAN      DEFAULT false
);

-- Admin → las 3 empresas
INSERT INTO usuario_empresa (usuario_id, empresa_id, rol) VALUES
  (1,1,'admin'),(1,2,'admin'),(1,3,'admin'),
  (2,1,'supervisor'),(2,2,'operador'),
  (3,1,'operador')
ON CONFLICT DO NOTHING;

UPDATE usuario_empresa
SET es_default = true
WHERE (usuario_id, empresa_id) IN ((1,1), (2,1), (3,1))
  AND NOT EXISTS (
    SELECT 1
    FROM usuario_empresa ue
    WHERE ue.usuario_id = usuario_empresa.usuario_id
      AND ue.es_default = true
  );

-- ── Leche: productos y catálogos por empresa ────────────────
CREATE TABLE IF NOT EXISTS tipos_producto (
  id          SERIAL PRIMARY KEY,
  descripcion VARCHAR(200) NOT NULL,
  empresa_id  INT          NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS unidades_medida (
  id          SERIAL PRIMARY KEY,
  descripcion VARCHAR(200) NOT NULL,
  empresa_id  INT          NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS proveedores (
  id          SERIAL PRIMARY KEY,
  descripcion VARCHAR(200) NOT NULL,
  rfc         VARCHAR(13),
  empresa_id  INT          NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS productos (
  id                      SERIAL PRIMARY KEY,
  tipo_producto_id         INT REFERENCES tipos_producto(id),
  division                INT DEFAULT 1 NOT NULL,
  codigo_erp              VARCHAR(50),
  codigo_proveedor        VARCHAR(50),
  codigo_alimentacion     VARCHAR(50),
  unidad_medida_id         INT REFERENCES unidades_medida(id),
  nombre                  VARCHAR(200),
  empresa_id              INT          NOT NULL DEFAULT 1,
  proveedor_id             INT REFERENCES proveedores(id),
  proveedor_ultima_compra  VARCHAR(100)
);

-- ── Catálogos generales por empresa ─────────────────────────
CREATE TABLE IF NOT EXISTS establos (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT          NOT NULL DEFAULT 1,
  descripcion VARCHAR(200) NOT NULL,
  numero      VARCHAR(20)  NOT NULL
);

CREATE TABLE IF NOT EXISTS dietas (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT          NOT NULL DEFAULT 1,
  descripcion VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS almacenes (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT          NOT NULL DEFAULT 1,
  descripcion VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS tipos_salida_leche (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT          NOT NULL DEFAULT 1,
  descripcion VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS corrales (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT          NOT NULL DEFAULT 1,
  descripcion VARCHAR(200) NOT NULL,
  establo_id  INT          NOT NULL REFERENCES establos(id)
);

-- ── Refresh Tokens ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  usuario_id INT          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token      VARCHAR(128) NOT NULL UNIQUE,
  expira_en  TIMESTAMPTZ  NOT NULL,
  creado_en  TIMESTAMPTZ  DEFAULT NOW()
);
