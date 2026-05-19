# Integración de Supabase - Pasos Finales

## ✅ Completado

### 1. Configuración de Credenciales
- ✅ `.env.local` creado con credenciales de Supabase
- ✅ Variables de entorno configuradas:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 2. Archivos de Integración Creados
- ✅ `lib/supabase.ts` - Cliente de Supabase
- ✅ `lib/supabase-store.ts` - Funciones de persistencia
- ✅ `lib/supabase-config.ts` - Verificación de configuración

### 3. Rutas API Actualizadas
- ✅ `/app/api/data/route.ts` - Ahora usa Supabase
- ✅ `/app/api/summary/route.ts` - Ahora usa Supabase
- ✅ `/app/api/config/route.ts` - Ahora usa Supabase
- ✅ `/app/api/export-pdf/route.ts` - Ahora usa Supabase

### 4. Dependencias
- ✅ `@supabase/supabase-js` agregado a `package.json`

---

## 🔧 Pasos Pendientes

### Paso 1: Ejecutar el Schema SQL en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto: `ntwzbbpthuquncgqaxmu`
3. Ve a **SQL Editor** en el menú lateral
4. Crea una nueva query
5. Copia y pega el contenido de `supabase-schema.sql`
6. Haz clic en **Run** (o presiona Ctrl+Enter)

**Resultado esperado:**
- Tabla `config` creada
- Tabla `daily_records` creada
- Índices creados
- RLS habilitado
- Políticas de seguridad aplicadas

### Paso 2: Instalar Dependencias

En tu terminal, ejecuta:

```bash
npm install
```

Esto instalará `@supabase/supabase-js` y todas las dependencias necesarias.

### Paso 3: Probar la Conexión

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Luego, abre tu navegador y ve a:
- `http://localhost:3000/api/config` - Debe devolver la configuración

**Respuesta esperada:**
```json
{
  "id": 1,
  "current_year": 2026,
  "current_month": 5,
  "current_day": 14,
  "updated_at": "2026-05-19T..."
}
```

### Paso 4: Cargar Datos Iniciales

1. Ve a `http://localhost:3000/cargar`
2. Crea un archivo CSV con el formato:
   ```
   Fecha;Colón;Serrano;Perón;San Martín;Virtual;Total;Tipo
   02.05.2026;1928;1510;1505;1934;429;7306;Clientes
   02.05.2026;1234;5678;9012;3456;789;20169;Producto
   02.05.2026;57761896;43244684;38956234;52123456;12345678;204432948;Facturacion
   ```
3. Carga el archivo
4. Verifica que los datos aparezcan en el dashboard

### Paso 5: Verificar Datos en Supabase

1. Ve a Supabase Dashboard
2. Selecciona **Table Editor**
3. Abre la tabla `daily_records`
4. Verifica que los datos cargados estén presentes

---

## 📊 Estructura de Datos

### Tabla `config`
```sql
id: INTEGER (PRIMARY KEY)
current_year: INTEGER
current_month: INTEGER
current_day: INTEGER
updated_at: TIMESTAMP
```

### Tabla `daily_records`
```sql
id: BIGSERIAL (PRIMARY KEY)
fecha: VARCHAR(10) -- DD/MM/YYYY
year: INTEGER
month: INTEGER
day: INTEGER
colon: INTEGER (nullable)
serrano: INTEGER (nullable)
peron: INTEGER (nullable)
san_martin: INTEGER (nullable)
virtual: INTEGER (nullable)
total: INTEGER
tipo: VARCHAR(20) -- 'Clientes', 'Producto', 'Facturacion'
created_at: TIMESTAMP
```

---

## 🔐 Seguridad

### Row Level Security (RLS)
- ✅ Habilitado en ambas tablas
- ✅ Políticas de lectura para usuarios autenticados
- ✅ Políticas de insert/update/delete para usuarios autenticados

### Variables de Entorno
- ✅ `.env.local` está en `.gitignore`
- ✅ No se subirá a GitHub
- ✅ Credenciales seguras

---

## 🚀 Próximos Pasos (Opcional)

### 1. Autenticación
Implementar autenticación de Supabase para restringir acceso:
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});
```

### 2. Backups Automáticos
En Supabase Dashboard:
1. Ve a **Settings** → **Backups**
2. Habilita backups automáticos diarios

### 3. Webhooks
Para notificaciones en tiempo real cuando se cargan datos:
1. Ve a **Database** → **Webhooks**
2. Crea un webhook para la tabla `daily_records`

### 4. Monitoreo
En Supabase Dashboard:
1. Ve a **Logs** para ver queries
2. Ve a **Monitoring** para ver métricas

---

## 📝 Notas

- La aplicación ahora usa Supabase como base de datos principal
- Los datos se persisten en la nube
- El store local (`lib/store.ts`) sigue disponible como fallback
- Todas las rutas API están actualizadas para usar Supabase
- El CSV parser está integrado en `lib/supabase-store.ts`

---

## ❓ Solución de Problemas

### Error: "Missing NEXT_PUBLIC_SUPABASE_URL"
- Verifica que `.env.local` existe en la raíz del proyecto
- Verifica que las variables están correctamente configuradas
- Reinicia el servidor de desarrollo

### Error: "relation 'config' does not exist"
- Ejecuta el schema SQL en Supabase SQL Editor
- Verifica que no hay errores en la ejecución

### Error: "permission denied for table config"
- Verifica las políticas RLS en Supabase
- Asegúrate de que el usuario está autenticado

### Los datos no se cargan
- Verifica la conexión a Supabase
- Revisa los logs en Supabase Dashboard
- Verifica que el CSV tiene el formato correcto

---

## 📞 Soporte

Para más información:
- [Documentación de Supabase](https://supabase.com/docs)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

