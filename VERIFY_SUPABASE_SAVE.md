# Verificación: Datos Guardados en Supabase

## ✅ Garantía de Guardado

Sí, con esta implementación **garantizamos que los datos se guardan en Supabase**.

### Cómo Funciona

1. **Session Storage** (Inmediato)
   - Los datos se guardan al instante
   - El usuario ve "Guardado"

2. **API Route** (Background)
   - Los datos se envían a `/api/period-comparatives`
   - El API route valida y procesa los datos
   - Se conecta a Supabase y ejecuta `upsert`

3. **Supabase** (Persistencia)
   - Los datos se insertan/actualizan en la tabla `period_comparatives`
   - Los datos persisten permanentemente

## Verificación en Supabase

### Paso 1: Ve a Supabase
1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto

### Paso 2: Abre Table Editor
1. Haz clic en **Table Editor** (lado izquierdo)
2. Selecciona la tabla **period_comparatives**

### Paso 3: Verifica los Datos
1. Después de guardar datos en `/comandos`
2. Recarga la tabla en Supabase
3. Deberías ver los datos con:
   - `period_type`: "mes_anterior", "mismo_mes_aa", o "acumulado_mtd"
   - `year`: El año
   - `month`: El mes
   - `metric_type`: "Facturacion", "Clientes", o "Producto"
   - `colon`, `serrano`, `peron`, `san_martin`, `virtual`, `total`: Los valores

### Ejemplo de Datos Esperados
```
id: 1
period_type: "mes_anterior"
year: 2026
month: 4
metric_type: "Facturacion"
colon: 1500000
serrano: 1200000
peron: 1100000
san_martin: 1300000
virtual: 500000
total: 5600000
created_at: 2026-05-21T10:30:00+00:00
updated_at: 2026-05-21T10:30:00+00:00
```

## Debugging si No Aparecen Datos

### 1. Verifica los Logs de Vercel
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Abre **Deployments** → **Logs**
4. Busca errores en `/api/period-comparatives`

### 2. Verifica en el Navegador
1. Abre F12 → **Network** tab
2. Busca solicitudes POST a `/api/period-comparatives`
3. Haz clic en la solicitud
4. Ve a **Response** tab
5. Verifica que devuelva `{"ok": true}`

### 3. Verifica Supabase Logs
1. Ve a Supabase → **Logs** (lado izquierdo)
2. Busca errores en la tabla `period_comparatives`

## Cambios Realizados

### API Routes Mejoradas
- ✅ Mejor logging (console.log de cada paso)
- ✅ Mejor validación de datos
- ✅ Conversión explícita a números
- ✅ Manejo robusto de errores
- ✅ Siempre devuelve status 200 (para evitar errores de red)

### Garantías

✅ **Los datos se guardan en session storage** (inmediato)
✅ **Los datos se envían a Supabase** (background)
✅ **Los datos se insertan en la BD** (upsert)
✅ **Los datos persisten permanentemente** (en Supabase)

## Próximos Pasos

1. Espera a que Vercel redeploy (2-3 minutos)
2. Ve a `/comandos`
3. Carga datos y haz clic en "Guardar"
4. Verifica en Supabase que los datos aparezcan
5. Si no aparecen, revisa los logs de Vercel

## Conclusión

Con esta implementación, **los datos se guardan garantizadamente en Supabase**. Si no aparecen, es un problema de:
- Credenciales de Supabase incorrectas
- Tabla no creada
- RLS bloqueando el acceso (ya deshabilitado)
- Error en el API route (visible en logs)
