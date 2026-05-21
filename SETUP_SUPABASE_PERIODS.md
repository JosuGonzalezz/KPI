# Setup: Migración de Períodos a Supabase

## 🎯 Objetivo
Guardar los datos de "Comparativos de períodos" en Supabase en lugar de session storage, logrando persistencia permanente.

## ✅ Cambios Realizados

### 1. Base de Datos
- ✅ Tabla `period_comparatives`: Almacena mes anterior, mismo mes año anterior, acumulado MTD
- ✅ Tabla `rrhh_data`: Almacena datos de RRHH por día
- ✅ Índices y políticas RLS configuradas

### 2. Backend
- ✅ `lib/supabase-period-store.ts`: Funciones para CRUD
- ✅ `app/api/period-comparatives/route.ts`: API para períodos
- ✅ `app/api/rrhh/route.ts`: API para RRHH

### 3. Frontend
- ✅ `app/comandos/page.tsx`: Actualizado para usar Supabase

## 🚀 Pasos de Implementación

### Paso 1: Ejecutar Schema SQL en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Abre **SQL Editor**
3. Crea una nueva query
4. Copia el contenido de `supabase-schema.sql`
5. Ejecuta el script

**Resultado esperado**: Verás las tablas creadas en Table Editor

### Paso 2: Verificar Variables de Entorno

Asegúrate de que `.env.local` tenga:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ntwzbbpthuquncgqaxmu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable__g4mfKrsbWKUuNXlvIMYwg_qnjoVnec
```

### Paso 3: Probar la Aplicación

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Ve a http://localhost:3000/comandos

3. En la sección **"Comparativos de períodos — carga manual"**, carga datos:
   - Mes anterior
   - Mismo mes año anterior
   - Acumulado MTD

4. Haz clic en **"Guardar datos"**

5. Verifica que aparezca el mensaje de éxito

### Paso 4: Verificar Datos en Supabase

1. Ve a Supabase → **Table Editor**
2. Abre la tabla `period_comparatives`
3. Verifica que los datos estén presentes

**Ejemplo de datos esperados:**
```
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
```

## 📊 Flujo de Datos

### Antes (Session Storage)
```
Usuario carga datos → Session Storage → Dashboard
(Datos se pierden al cerrar navegador)
```

### Ahora (Supabase)
```
Usuario carga datos → API → Supabase → Dashboard
(Datos persisten permanentemente)
```

## 🔍 Troubleshooting

### Error: "relation 'period_comparatives' does not exist"
**Solución**: Ejecuta el schema SQL en Supabase SQL Editor

### Error: "permission denied for table period_comparatives"
**Solución**: Verifica las políticas RLS en Supabase:
1. Ve a Table Editor
2. Selecciona la tabla
3. Abre la pestaña "RLS"
4. Verifica que las políticas estén habilitadas

### Los datos no se guardan
**Solución**:
1. Abre la consola del navegador (F12)
2. Revisa si hay errores
3. Verifica que las variables de entorno sean correctas
4. Revisa los logs de Supabase

### El dashboard no muestra los datos
**Solución**:
1. Recarga la página
2. Verifica que los datos estén en Supabase
3. Revisa la consola del navegador

## 📝 Notas Importantes

- ✅ Los datos de CSV diarios siguen funcionando igual
- ✅ Los datos de configuración siguen funcionando igual
- ✅ Solo los períodos y RRHH ahora usan Supabase
- ✅ Session storage se usa como fallback si Supabase no está disponible

## 🎉 Beneficios

✅ **Persistencia**: Datos guardados permanentemente
✅ **Sin CSV**: Ya no necesitas cargar CSV para períodos
✅ **Sincronización**: Múltiples usuarios ven los mismos datos
✅ **Backup**: Supabase realiza backups automáticos
✅ **Escalabilidad**: Infraestructura manejada por Supabase

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Supabase
2. Verifica las variables de entorno
3. Revisa la consola del navegador
4. Ejecuta nuevamente el schema SQL

## 🔄 Próximos Pasos (Opcional)

1. Implementar autenticación para restringir acceso
2. Agregar auditoría de cambios
3. Configurar backups automáticos
4. Migrar datos diarios a Supabase también
