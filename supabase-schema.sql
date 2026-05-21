-- ============================================================
-- SUPABASE SCHEMA — Tablas para el Reporte de KPI
-- ============================================================

-- Tabla de configuración
CREATE TABLE IF NOT EXISTS config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_year INTEGER NOT NULL DEFAULT 2026,
  current_month INTEGER NOT NULL DEFAULT 5,
  current_day INTEGER NOT NULL DEFAULT 14,
  prev_month_year INTEGER,
  prev_month_month INTEGER,
  prev_month_name VARCHAR(20),
  same_month_last_year_year INTEGER,
  same_month_last_year_month INTEGER,
  same_month_last_year_name VARCHAR(20),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de registros diarios
CREATE TABLE IF NOT EXISTS daily_records (
  id BIGSERIAL PRIMARY KEY,
  fecha VARCHAR(10) NOT NULL,  -- DD.MM.YYYY
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  day INTEGER NOT NULL,
  colon INTEGER,
  serrano INTEGER,
  peron INTEGER,
  san_martin INTEGER,
  virtual INTEGER,
  total INTEGER NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Clientes', 'Producto', 'Facturacion')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(fecha, tipo)
);

-- Tabla de totales mensuales (para meses cerrados)
CREATE TABLE IF NOT EXISTS monthly_totals (
  id BIGSERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  month_name VARCHAR(20) NOT NULL,  -- Nombre del mes (ej: "Abril")
  colon BIGINT NOT NULL,
  serrano BIGINT NOT NULL,
  peron BIGINT NOT NULL,
  san_martin BIGINT NOT NULL,
  virtual BIGINT NOT NULL,
  total BIGINT NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Clientes', 'Productos', 'Facturacion')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(year, month, tipo)
);

-- Tabla de comparativos de períodos (carga manual)
CREATE TABLE IF NOT EXISTS period_comparatives (
  id BIGSERIAL PRIMARY KEY,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('mes_anterior', 'mismo_mes_aa', 'acumulado_mtd')),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  metric_type VARCHAR(20) NOT NULL CHECK (metric_type IN ('Clientes', 'Producto', 'Facturacion')),
  colon BIGINT NOT NULL DEFAULT 0,
  serrano BIGINT NOT NULL DEFAULT 0,
  peron BIGINT NOT NULL DEFAULT 0,
  san_martin BIGINT NOT NULL DEFAULT 0,
  virtual BIGINT NOT NULL DEFAULT 0,
  total BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(period_type, year, month, metric_type)
);

-- Tabla de datos RRHH (ayer)
CREATE TABLE IF NOT EXISTS rrhh_data (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  colon_programados INTEGER NOT NULL DEFAULT 0,
  colon_presentes INTEGER NOT NULL DEFAULT 0,
  serrano_programados INTEGER NOT NULL DEFAULT 0,
  serrano_presentes INTEGER NOT NULL DEFAULT 0,
  peron_programados INTEGER NOT NULL DEFAULT 0,
  peron_presentes INTEGER NOT NULL DEFAULT 0,
  san_martin_programados INTEGER NOT NULL DEFAULT 0,
  san_martin_presentes INTEGER NOT NULL DEFAULT 0,
  virtual_programados INTEGER NOT NULL DEFAULT 0,
  virtual_presentes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_daily_records_year_month ON daily_records(year, month);
CREATE INDEX IF NOT EXISTS idx_daily_records_fecha ON daily_records(fecha);
CREATE INDEX IF NOT EXISTS idx_daily_records_tipo ON daily_records(tipo);
CREATE INDEX IF NOT EXISTS idx_daily_records_branch ON daily_records(colon, serrano, peron, san_martin, virtual);

CREATE INDEX IF NOT EXISTS idx_monthly_totals_year_month ON monthly_totals(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_totals_tipo ON monthly_totals(tipo);

CREATE INDEX IF NOT EXISTS idx_period_comparatives_period_type ON period_comparatives(period_type);
CREATE INDEX IF NOT EXISTS idx_period_comparatives_year_month ON period_comparatives(year, month);
CREATE INDEX IF NOT EXISTS idx_period_comparatives_metric ON period_comparatives(metric_type);

CREATE INDEX IF NOT EXISTS idx_rrhh_data_date ON rrhh_data(date);

-- Habilitar RLS (Row Level Security)
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_totals ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_comparatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrhh_data ENABLE ROW LEVEL SECURITY;

-- Políticas para config (solo lectura para usuarios autenticados)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'config' AND policyname = 'Anyone can read config'
  ) THEN
    CREATE POLICY "Anyone can read config"
      ON config
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Políticas para daily_records (solo lectura para usuarios autenticados)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'daily_records' AND policyname = 'Anyone can read daily_records'
  ) THEN
    CREATE POLICY "Anyone can read daily_records"
      ON daily_records
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Políticas para insert (solo usuarios autenticados)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'daily_records' AND policyname = 'Authenticated users can insert daily_records'
  ) THEN
    CREATE POLICY "Authenticated users can insert daily_records"
      ON daily_records
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Políticas para update (solo usuarios autenticados)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'daily_records' AND policyname = 'Authenticated users can update daily_records'
  ) THEN
    CREATE POLICY "Authenticated users can update daily_records"
      ON daily_records
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Políticas para delete (solo usuarios autenticados)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'daily_records' AND policyname = 'Authenticated users can delete daily_records'
  ) THEN
    CREATE POLICY "Authenticated users can delete daily_records"
      ON daily_records
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Políticas para monthly_totals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'monthly_totals' AND policyname = 'Anyone can read monthly_totals'
  ) THEN
    CREATE POLICY "Anyone can read monthly_totals"
      ON monthly_totals
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'monthly_totals' AND policyname = 'Authenticated users can insert monthly_totals'
  ) THEN
    CREATE POLICY "Authenticated users can insert monthly_totals"
      ON monthly_totals
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'monthly_totals' AND policyname = 'Authenticated users can update monthly_totals'
  ) THEN
    CREATE POLICY "Authenticated users can update monthly_totals"
      ON monthly_totals
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'monthly_totals' AND policyname = 'Authenticated users can delete monthly_totals'
  ) THEN
    CREATE POLICY "Authenticated users can delete monthly_totals"
      ON monthly_totals
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Políticas para period_comparatives
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'period_comparatives' AND policyname = 'Anyone can read period_comparatives'
  ) THEN
    CREATE POLICY "Anyone can read period_comparatives"
      ON period_comparatives
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'period_comparatives' AND policyname = 'Authenticated users can insert period_comparatives'
  ) THEN
    CREATE POLICY "Authenticated users can insert period_comparatives"
      ON period_comparatives
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'period_comparatives' AND policyname = 'Authenticated users can update period_comparatives'
  ) THEN
    CREATE POLICY "Authenticated users can update period_comparatives"
      ON period_comparatives
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'period_comparatives' AND policyname = 'Authenticated users can delete period_comparatives'
  ) THEN
    CREATE POLICY "Authenticated users can delete period_comparatives"
      ON period_comparatives
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Políticas para rrhh_data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rrhh_data' AND policyname = 'Anyone can read rrhh_data'
  ) THEN
    CREATE POLICY "Anyone can read rrhh_data"
      ON rrhh_data
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rrhh_data' AND policyname = 'Authenticated users can insert rrhh_data'
  ) THEN
    CREATE POLICY "Authenticated users can insert rrhh_data"
      ON rrhh_data
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rrhh_data' AND policyname = 'Authenticated users can update rrhh_data'
  ) THEN
    CREATE POLICY "Authenticated users can update rrhh_data"
      ON rrhh_data
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rrhh_data' AND policyname = 'Authenticated users can delete rrhh_data'
  ) THEN
    CREATE POLICY "Authenticated users can delete rrhh_data"
      ON rrhh_data
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = TIMEZONE('utc'::text, NOW());
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_config_updated_at ON config;
CREATE TRIGGER update_config_updated_at
BEFORE UPDATE ON config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_period_comparatives_updated_at ON period_comparatives;
CREATE TRIGGER update_period_comparatives_updated_at
BEFORE UPDATE ON period_comparatives
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rrhh_data_updated_at ON rrhh_data;
CREATE TRIGGER update_rrhh_data_updated_at
BEFORE UPDATE ON rrhh_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuración por defecto si no existe
INSERT INTO config (id, current_year, current_month, current_day)
VALUES (1, 2026, 5, 14)
ON CONFLICT (id) DO NOTHING;
