# Guía de Migración a Supabase

## Pasos para configurar Supabase

### 1. Crear la base de datos en Supabase

1. Ve a [supabase.com](https://supabase.com) y haz login
2. Crea un nuevo proyecto (o usa uno existente)
3. Copia las credenciales:
   - **Project URL**: `https://ntwzbbpthuquncgqaxmu.supabase.co`
   - **anon/public key**: `sb_publishable__g4mfKrsbWKUuNXlvIMYwg_qnjoVnec`

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ntwzbbpthuquncgqaxmu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable__g4mfKrsbWKUuNXlvIMYwg_qnjoVnec
```

### 3. Crear las tablas

#### Opción A: Usando el SQL Editor de Supabase (Recomendado)

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `supabase-schema.sql`
3. Haz clic en **Run**

#### Opción B: Usando psql

```bash
# Instalar psql si no lo tienes
# Windows (con Chocolatey):
choco install postgresql14

# Conectar a tu base de datos
psql "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres"

# Ejecutar el schema
\i /path/to/supabase-schema.sql
```

### 4. Verificar la configuración

Ejecuta el siguiente comando para verificar que todo esté funcionando:

```bash
npm run dev
```

Si ves el mensaje `✅ Supabase configurado correctamente.` en la consola, la integración es exitosa.

### 5. Cargar datos iniciales

Si quieres cargar los datos de ejemplo:

1. Ve a la página `/cargar` en tu aplicación
2. Copia los datos de `lib/report-data.ts` (sección `may2026`)
3. Crea un archivo CSV con el formato:
   ```
   Fecha;Colón;Serrano;Perón;San Martín;Virtual;Total;Tipo
   02.05.2026;1928;1510;1505;1934;429;7306;Clientes
   ...
   ```
4. Carga el archivo desde el panel

### 6. (Opcional) Configurar RLS

Las políticas de seguridad ya están definidas en `supabase-schema.sql`. Si necesitas ajustarlas:

```sql
-- Ejemplo: Permitir solo a usuarios específicos
CREATE POLICY "Users can read their own data"
  ON daily_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

## Solución de problemas

### Error: "relation 'config' does not exist"

Asegúrate de haber ejecutado el schema SQL correctamente.

### Error: "permission denied for table config"

Verifica que las políticas RLS estén configuradas correctamente.

### Error: "duplicate key value violates unique constraint"

El registro ya existe. Usa `ON CONFLICT DO UPDATE` o borra el registro existente.

## Estructura de tablas

### `config`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | INTEGER | ID único (siempre 1) |
| current_year | INTEGER | Año del mes en curso |
| current_month | INTEGER | Mes en curso (1-12) |
| current_day | INTEGER | Último día cargado |
| updated_at | TIMESTAMP | Última actualización |

### `daily_records`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | BIGSERIAL | ID único |
| fecha | VARCHAR(10) | Fecha en formato DD.MM.YYYY |
| year | INTEGER | Año |
| month | INTEGER | Mes |
| day | INTEGER | Día |
| colon | INTEGER | Facturación/Clientes/Productos Colón |
| serrano | INTEGER | Facturación/Clientes/Productos Serrano |
| peron | INTEGER | Facturación/Clientes/Productos Perón |
| san_martin | INTEGER | Facturación/Clientes/Productos San Martín |
| virtual | INTEGER | Facturación/Clientes/Productos Virtual |
| total | INTEGER | Total cadena |
| tipo | VARCHAR(20) | 'Clientes', 'Producto' o 'Facturacion' |
| created_at | TIMESTAMP | Fecha de creación |

## Próximos pasos

1. ✅ Configurar variables de entorno
2. ✅ Crear tablas con el schema SQL
3. ✅ Cargar datos iniciales
4. ✅ Probar la aplicación
5. 🔄 Implementar autenticación (opcional)
6. 🔄 Configurar backups automáticos (recomendado)
