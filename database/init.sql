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
  rfc        VARCHAR(13)  ,
  estatus    BOOLEAN      DEFAULT true,  
  color      VARCHAR(10)  DEFAULT '#1e5a96',
  logo_url   VARCHAR(255),
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
  es_default BOOLEAN DEFAULT false,
  estatus    BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (usuario_id, empresa_id)
);

ALTER TABLE usuario_empresa ADD COLUMN IF NOT EXISTS es_default BOOLEAN DEFAULT false;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'usuario_empresa'
      AND column_name = 'esDefault'
  ) THEN
    EXECUTE 'UPDATE usuario_empresa SET es_default = "esDefault" WHERE "esDefault" = true';
  END IF;
END $$;

-- Admin → las 3 empresas
INSERT INTO usuario_empresa (usuario_id, empresa_id, rol) VALUES
  (1,1,'admin'),(1,2,'admin'),(1,3,'admin'),
  (2,1,'supervisor'),(2,2,'operador'),
  (3,1,'operador')
ON CONFLICT (usuario_id, empresa_id) DO NOTHING;

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
  empresa_id  INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  descripcion VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS unidades_medida (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  descripcion VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS proveedores (
  id          SERIAL PRIMARY KEY,
  empresa_id  INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  descripcion VARCHAR(200) NOT NULL,
  rfc         VARCHAR(13)
);

CREATE TABLE IF NOT EXISTS productos (
  id                      SERIAL PRIMARY KEY,
  empresa_id              INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre                  VARCHAR(200),
  tipo_producto_id         INT REFERENCES tipos_producto(id) ON DELETE SET NULL,
  division                INT,
  proveedor_ultima_compra  INT,
  codigo_erp              VARCHAR(50),
  codigo_proveedor        VARCHAR(50),
  codigo_alimentacion     VARCHAR(50),
  unidad_medida_id         INT REFERENCES unidades_medida(id) ON DELETE SET NULL
);

-- Migración ligera para bases existentes creadas antes del contexto por empresa.
ALTER TABLE tipos_producto ADD COLUMN IF NOT EXISTS empresa_id INT;
ALTER TABLE unidades_medida ADD COLUMN IF NOT EXISTS empresa_id INT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS empresa_id INT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS empresa_id INT;

UPDATE tipos_producto SET empresa_id = 1 WHERE empresa_id IS NULL;
UPDATE unidades_medida SET empresa_id = 1 WHERE empresa_id IS NULL;
UPDATE proveedores SET empresa_id = 1 WHERE empresa_id IS NULL;
UPDATE productos SET empresa_id = 1 WHERE empresa_id IS NULL;

ALTER TABLE tipos_producto ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE unidades_medida ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE proveedores ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE productos ALTER COLUMN empresa_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tipos_producto_empresa') THEN
    ALTER TABLE tipos_producto
      ADD CONSTRAINT fk_tipos_producto_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_unidades_medida_empresa') THEN
    ALTER TABLE unidades_medida
      ADD CONSTRAINT fk_unidades_medida_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proveedores_empresa') THEN
    ALTER TABLE proveedores
      ADD CONSTRAINT fk_proveedores_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_productos_empresa') THEN
    ALTER TABLE productos
      ADD CONSTRAINT fk_productos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tipos_producto_empresa ON tipos_producto (empresa_id);
CREATE INDEX IF NOT EXISTS idx_unidades_medida_empresa ON unidades_medida (empresa_id);
CREATE INDEX IF NOT EXISTS idx_proveedores_empresa ON proveedores (empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_empresa ON productos (empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_empresa_nombre ON productos (empresa_id, nombre);

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
