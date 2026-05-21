# Migración a Supabase - Comparativos de Períodos

## Cambios Realizados

### 1. Schema SQL Actualizado
Se agregaron 2 nuevas tablas a `supabase-schema.sql`:

- **`period_comparatives`**: Almacena datos de "Mes anterior", "Mismo mes año anterior" y "Acumulado MTD"
  - Campos: `period_type`, `year`, `month`, `metric_type`, `colon`, `serrano`, `peron`, `san_martin`, `virtual`, `total`
  - Índices para búsquedas rápidas

- **`rrhh_data`**: Almacena datos de RRHH por día
  - Campos: `date`, `colon_programados`, `colon_presentes`, etc.

### 2. Nuevos Archivos Creados

- **`lib/supabase-period-store.ts`**: Funciones para cargar/guardar datos de Supabase
  - `loadPeriodFromSupabase()`: Carga datos de un período
  - `savePeriodToSupabase()`: Guarda datos de un período
  - `loadRRHHFromSupabase()`: Carga datos RRHH
  - `saveRRHHToSupabase()`: Guarda datos RRHH

- **`app/api/period-comparatives/route.ts`**: API para CRUD de períodos
  - GET: Obtiene datos de un período
  - POST: Guarda/actualiza datos
  - DELETE: Elimina datos

- **`app/api/rrhh/route.ts`**: API para CRUD de RRHH
  - GET: Obtiene datos RRHH
  - POST: Guarda/actualiza datos

### 3. Cambios en `app/comandos/page.tsx`

La página de comandos ahora:
- Carga datos de Supabase en lugar de session storage
- Guarda datos en Supabase en lugar de session storage
- Mantiene la misma interfaz de usuario

## Pasos de Migración

### 1. Ejecutar Schema SQL en Supabase

1. Ve a tu proyecto en Supabase
2. Abre el SQL Editor
3. Copia el contenido de `supabase-schema.sql`
4. Ejecuta el script

### 2. Verificar Variables de Entorno

Asegúrate de que `.env.local` tenga:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ntwzbbpthuquncgqaxmu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable__g4mfKrsbWKUuNXlvIMYwg_qnjoVnec
```

### 3. Probar la Aplicación

1. Inicia el servidor: `npm run dev`
2. Ve a `/comandos`
3. Carga datos en "Comparativos de períodos — carga manual"
4. Verifica que los datos se guarden en Supabase

### 4. Verificar Datos en Supabase

1. Ve a Supabase → Table Editor
2. Abre la tabla `period_comparatives`
3. Verifica que los datos estén presentes

## Flujo de Datos

### Antes (Session Storage)
```
Usuario carga datos → Session Storage → Dashboard lee de Session Storage
```

### Ahora (Supabase)
```
Usuario carga datos → API → Supabase → Dashboard lee de Supabase
```

## Beneficios

✅ **Persistencia**: Los datos se guardan permanentemente en Supabase
✅ **Sincronización**: Múltiples usuarios pueden acceder a los mismos datos
✅ **Backup**: Supabase realiza backups automáticos
✅ **Escalabilidad**: Supabase maneja la infraestructura

## Próximos Pasos

1. Eliminar session storage para períodos (mantener solo para datos diarios si es necesario)
2. Implementar autenticación para restringir acceso
3. Agregar auditoría de cambios
4. Configurar backups automáticos

## Troubleshooting

### Error: "relation 'period_comparatives' does not exist"
- Ejecuta el schema SQL en Supabase

### Error: "permission denied"
- Verifica las políticas RLS en Supabase

### Los datos no se guardan
- Verifica que las variables de entorno sean correctas
- Revisa la consola del navegador para errores
- Verifica los logs de Supabase
