# Fix: Deshabilitar RLS en Supabase

## Problema
Los datos no se guardaban porque las políticas RLS estaban bloqueando el acceso.

## Solución
Deshabilitar RLS en las tablas `period_comparatives` y `rrhh_data`.

## Pasos

### 1. Ejecutar Script SQL en Supabase

1. Ve a tu proyecto en Supabase
2. Abre **SQL Editor**
3. Crea una nueva query
4. Copia y ejecuta:

```sql
-- Deshabilitar RLS en las tablas
ALTER TABLE period_comparatives DISABLE ROW LEVEL SECURITY;
ALTER TABLE rrhh_data DISABLE ROW LEVEL SECURITY;
```

### 2. Verificar en Supabase

1. Ve a **Table Editor**
2. Selecciona `period_comparatives`
3. Abre la pestaña **RLS**
4. Verifica que esté **deshabilitado**

### 3. Probar la Aplicación

1. Ve a `/comandos`
2. Carga datos en "Comparativos de períodos"
3. Haz clic en "Guardar datos"
4. Verifica que aparezca el mensaje de éxito

### 4. Verificar Datos en Supabase

1. Ve a **Table Editor**
2. Abre `period_comparatives`
3. Verifica que los datos estén presentes

## ¿Por qué?

- Las políticas RLS estaban configuradas para usuarios autenticados
- Pero el cliente no estaba enviando credenciales de autenticación
- La solución es usar API routes (backend) que sí tienen permisos
- O deshabilitar RLS si no necesitas restricciones de seguridad

## Alternativa (Más Segura)

Si quieres mantener RLS habilitado:
1. Implementar autenticación en la aplicación
2. Usar Supabase Auth
3. Las políticas RLS verificarán `auth.uid()`

Por ahora, deshabilitar RLS es la solución más rápida.
