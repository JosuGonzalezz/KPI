-- Deshabilitar RLS en las tablas para permitir acceso desde API
ALTER TABLE period_comparatives DISABLE ROW LEVEL SECURITY;
ALTER TABLE rrhh_data DISABLE ROW LEVEL SECURITY;

-- Opcional: Deshabilitar en otras tablas si es necesario
-- ALTER TABLE config DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_records DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE monthly_totals DISABLE ROW LEVEL SECURITY;
