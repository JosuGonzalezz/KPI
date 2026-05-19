# ✅ Sistema de Totales Mensuales - Listo para usar

## 🚨 PASO 1: Actualizar Supabase (OBLIGATORIO)

Antes de usar el sistema, **DEBES** ejecutar este SQL en Supabase:

### Cómo hacerlo:
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Haz clic en **"SQL Editor"** (menú lateral)
4. Haz clic en **"New query"**
5. Copia y pega el código de abajo
6. Haz clic en **"Run"**

### SQL a ejecutar:

```sql
-- 1. Crear tabla de totales mensuales
CREATE TABLE IF NOT EXISTS monthly_totals (
  id BIGSERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  month_name VARCHAR(20) NOT NULL,
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

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_monthly_totals_year_month ON monthly_totals(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_totals_tipo ON monthly_totals(tipo);

-- 3. Habilitar RLS
ALTER TABLE monthly_totals ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de seguridad
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

-- 5. Actualizar tabla config (agregar campos)
ALTER TABLE config 
ADD COLUMN IF NOT EXISTS prev_month_year INTEGER,
ADD COLUMN IF NOT EXISTS prev_month_month INTEGER,
ADD COLUMN IF NOT EXISTS prev_month_name VARCHAR(20),
ADD COLUMN IF NOT EXISTS same_month_last_year_year INTEGER,
ADD COLUMN IF NOT EXISTS same_month_last_year_month INTEGER,
ADD COLUMN IF NOT EXISTS same_month_last_year_name VARCHAR(20);
```

---

## 📋 PASO 2: Usar el nuevo sistema

### 1. Ir al Panel de Comandos
```
https://tu-app.vercel.app/comandos
```

### 2. Cargar totales del mes anterior

**a) Descargar plantilla:**
- Haz clic en "Descargar plantilla" (sección azul "Mes anterior")
- Se descarga: `Totales_Abril_2026.csv`

**b) Completar plantilla:**
Abre en Excel y completa las 3 filas:

```
Fecha   Colón       Serrano     Perón       San Martín  Virtual     Total       Tipo
Abril   1876309985  1328529434  1443108457  1059547844  720084664   6427580383  Facturacion
Abril   48865       49942       36417       35752       9816        180792      Clientes
Abril   549411      402771      394388      319111      215741      1881422     Productos
```

**c) Cargar archivo:**
- Haz clic en "Seleccionar CSV"
- Selecciona el archivo
- Haz clic en "Confirmar carga"
- ✅ Verás mensaje de éxito

### 3. Cargar totales del mismo mes año anterior

**Repite el mismo proceso** para la sección verde "Mismo mes año anterior"

### 4. Cargar datos diarios del mes en curso

Usa la sección "Cargar archivo CSV" (la de siempre) para cargar datos día por día del mes actual.

---

## 📊 Formato de datos

### Totales mensuales (3 filas)
```
Fecha: Nombre del mes (ej: "Abril")
Tipo: Facturacion, Clientes o Productos
Separador: Tabulación (TAB)
```

### Datos diarios (3 filas por día)
```
Fecha: DD.MM.YYYY (ej: "14.05.2026")
Tipo: Facturacion, Clientes o Producto
Separador: Tabulación (TAB)
```

---

## ✅ Verificar que funcionó

1. **En Supabase:**
   - Ve a "Table Editor"
   - Deberías ver la tabla `monthly_totals`
   - Haz clic en `config` y verifica los nuevos campos

2. **En la app:**
   - Carga un archivo de totales mensuales
   - Deberías ver: "✅ Totales cargados exitosamente (3 registros)"

---

## 🎯 Ventajas del nuevo sistema

| Antes | Ahora |
|-------|-------|
| Cargar 30+ días por mes | Cargar solo 3 filas por mes |
| Propenso a errores | Simple y directo |
| Difícil de mantener | Fácil de actualizar |
| Lento | Instantáneo |

---

## 🆘 Troubleshooting

### "Error al cargar"
- Verifica que ejecutaste el SQL en Supabase
- Verifica que el archivo tenga 3 filas (Facturacion, Clientes, Productos)
- Verifica que el separador sea tabulación

### "Advertencias de parseo"
- Si estás cargando totales mensuales, usa la sección "Cargar totales de meses cerrados"
- Si estás cargando datos diarios, usa la sección "Cargar archivo CSV"

### "Cannot use import statement"
- Espera 2-3 minutos para que Vercel termine el redeploy
- Refresca la página

---

## 📝 Resumen

1. ✅ Ejecutar SQL en Supabase (crear tabla `monthly_totals`)
2. ✅ Esperar redeploy de Vercel (2-3 minutos)
3. ✅ Descargar plantilla de totales mensuales
4. ✅ Completar 3 filas (Facturacion, Clientes, Productos)
5. ✅ Cargar archivo
6. ✅ Repetir para el otro mes
7. ✅ Cargar datos diarios del mes en curso

---

**Última actualización**: Mayo 2026
**Estado**: Listo para producción
**Versión**: 3.1.0
