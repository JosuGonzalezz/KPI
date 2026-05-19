# Integración con Supabase

Este documento describe la integración de Supabase como sistema de persistencia para el Reporte de KPI.

## Arquitectura

### Antes (Persistencia Local)
```
Datos CSV → Store (JSON) → Dashboard
```

### Ahora (Persistencia en Supabase)
```
Datos CSV → Store (Supabase) → Dashboard
```

## Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `lib/supabase.ts` | Cliente de Supabase configurado |
| `lib/supabase-config.ts` | Verificación de configuración |
| `lib/supabase-store.ts` | Reemplazo del store local con Supabase |
| `supabase-schema.sql` | Schema de tablas para Supabase |
| `supabase-migration.md` | Guía de migración paso a paso |
| `scripts/migrate-to-supabase.ts` | Script de migración automática |

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ntwzbbpthuquncgqaxmu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable__g4mfKrsbWKUuNXlvIMYwg_qnjoVnec
```

### 2. Tablas de Supabase

Ejecuta el schema SQL en el SQL Editor de Supabase:

```sql
-- Tabla de configuración
CREATE TABLE config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_year INTEGER NOT NULL DEFAULT 2026,
  current_month INTEGER NOT NULL DEFAULT 5,
  current_day INTEGER NOT NULL DEFAULT 14,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de registros diarios
CREATE TABLE daily_records (
  id BIGSERIAL PRIMARY KEY,
  fecha VARCHAR(10) NOT NULL,
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
```

## Uso

### API Routes

Las API routes ya están preparadas para usar Supabase. Solo necesitas descomentar las líneas correspondientes.

**Ejemplo: `/app/api/data/route.ts`**

```typescript
// import { getAllRecords, getRecordsByYearMonth, upsertRecords, deleteByYearMonth } from "@/lib/supabase-store";
import { getAllRecords, getRecordsByYearMonth, upsertRecords, deleteByYearMonth } from "@/lib/store"; // Local

export async function GET(req: NextRequest) {
  // ...
}
```

### Store

Para usar Supabase en lugar del store local, cambia la importación:

```typescript
// import { getConfig, saveConfig, getAllRecords, ... } from "@/lib/store";
import { getConfig, saveConfig, getAllRecords, ... } from "@/lib/supabase-store";
```

## Tablas

### `config`

Almacena la configuración del reporte:
- Año, mes y día actual
- Última actualización

### `daily_records`

Almacena los datos diarios por sucursal:
- Facturación, Clientes, Productos
- Por sucursal (Colón, Serrano, Perón, San Martín, Virtual)
- Total cadena

## Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Las políticas por defecto permiten:
- Lectura para usuarios autenticados
- Insert/Update/Delete para usuarios autenticados

### Políticas Personalizadas

Para restringir el acceso, edita el schema SQL:

```sql
-- Solo permitir lectura a usuarios específicos
CREATE POLICY "Users can read their own data"
  ON daily_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

## Migración de Datos

### Opción 1: Manual

1. Ve a `/cargar` en tu aplicación
2. Crea un archivo CSV con el formato:
   ```
   Fecha;Colón;Serrano;Perón;San Martín;Virtual;Total;Tipo
   02.05.2026;1928;1510;1505;1934;429;7306;Clientes
   ...
   ```
3. Carga el archivo

### Opción 2: Script

Ejecuta el script de migración:

```bash
npx tsx scripts/migrate-to-supabase.ts
```

## Solución de Problemas

### Error: "relation 'config' does not exist"

Ejecuta el schema SQL en el SQL Editor de Supabase.

### Error: "permission denied for table config"

Verifica las políticas RLS en la pestaña "Table Editor" → "RLS" de Supabase.

### Error: "duplicate key value violates unique constraint"

El registro ya existe. Usa `ON CONFLICT DO UPDATE` o borra el registro existente.

## Próximos Pasos

1. ✅ Configurar variables de entorno
2. ✅ Crear tablas con el schema SQL
3. ✅ Cargar datos iniciales
4. ✅ Probar la aplicación
5. 🔄 Implementar autenticación (opcional)
6. 🔄 Configurar backups automáticos (recomendado)
7. 🔄 Implementar webhooks para notificaciones (opcional)

## Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
