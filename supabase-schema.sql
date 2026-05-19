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

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_daily_records_year_month ON daily_records(year, month);
CREATE INDEX IF NOT EXISTS idx_daily_records_fecha ON daily_records(fecha);
CREATE INDEX IF NOT EXISTS idx_daily_records_tipo ON daily_records(tipo);
CREATE INDEX IF NOT EXISTS idx_daily_records_branch ON daily_records(colon, serrano, peron, san_martin, virtual);

CREATE INDEX IF NOT EXISTS idx_monthly_totals_year_month ON monthly_totals(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_totals_tipo ON monthly_totals(tipo);

-- Habilitar RLS (Row Level Security)
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_totals ENABLE ROW LEVEL SECURITY;

-- Políticas para config (solo lectura para usuarios autenticados)
CREATE POLICY "Anyone can read config"
  ON config
  FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para daily_records (solo lectura para usuarios autenticados)
CREATE POLICY "Anyone can read daily_records"
  ON daily_records
  FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para insert (solo usuarios autenticados)
CREATE POLICY "Authenticated users can insert daily_records"
  ON daily_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para update (solo usuarios autenticados)
CREATE POLICY "Authenticated users can update daily_records"
  ON daily_records
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para delete (solo usuarios autenticados)
CREATE POLICY "Authenticated users can delete daily_records"
  ON daily_records
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para monthly_totals
CREATE POLICY "Anyone can read monthly_totals"
  ON monthly_totals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert monthly_totals"
  ON monthly_totals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update monthly_totals"
  ON monthly_totals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete monthly_totals"
  ON monthly_totals
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = TIMEZONE('utc'::text, NOW());
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_config_updated_at
BEFORE UPDATE ON config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuración por defecto si no existe
INSERT INTO config (id, current_year, current_month, current_day)
VALUES (1, 2026, 5, 14)
ON CONFLICT (id) DO NOTHING;
