# 🚀 Guía Rápida - Integración de Supabase

## ⏱️ Tiempo estimado: 5 minutos

---

## Paso 1: Ejecutar Schema SQL (2 min)

### En Supabase Dashboard:
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto: **ntwzbbpthuquncgqaxmu**
3. Haz clic en **SQL Editor** (menú izquierdo)
4. Haz clic en **New Query**
5. Copia todo el contenido de `supabase-schema.sql`
6. Pégalo en el editor
7. Haz clic en **Run** (o presiona Ctrl+Enter)

**Resultado esperado:** ✅ Query ejecutada sin errores

---

## Paso 2: Instalar Dependencias (1 min)

### En tu terminal:
```bash
npm install
```

**Resultado esperado:** ✅ `@supabase/supabase-js` instalado

---

## Paso 3: Iniciar Servidor (1 min)

### En tu terminal:
```bash
npm run dev
```

**Resultado esperado:** ✅ Servidor corriendo en `http://localhost:3000`

---

## Paso 4: Probar Conexión (1 min)

### En otra terminal:
```bash
npx tsx scripts/test-supabase.ts
```

**Resultado esperado:**
```
✓ Cliente de Supabase inicializado
✓ Configuración: { id: 1, current_year: 2026, ... }
✓ Total de registros: 0
✓ Registros de mayo: 0
✅ Todos los tests pasaron correctamente!
```

---

## Paso 5: Cargar Datos (Opcional)

### En tu navegador:
1. Abre `http://localhost:3000/cargar`
2. Crea un archivo CSV con este formato:
   ```
   Fecha;Colón;Serrano;Perón;San Martín;Virtual;Total;Tipo
   02.05.2026;1928;1510;1505;1934;429;7306;Clientes
   02.05.2026;1234;5678;9012;3456;789;20169;Producto
   02.05.2026;57761896;43244684;38956234;52123456;12345678;204432948;Facturacion
   ```
3. Carga el archivo
4. Verifica que aparezcan en el dashboard

---

## ✅ ¡Listo!

Tu aplicación está completamente integrada con Supabase.

### Próximos pasos:
- 📊 Abre `http://localhost:3000` para ver el dashboard
- 📁 Carga más datos desde `/cargar`
- 📈 Verifica los KPIs en el dashboard
- 🚀 Despliega en Vercel cuando esté listo

---

## 🔗 URLs Útiles

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000` | Dashboard principal |
| `http://localhost:3000/cargar` | Cargar datos CSV |
| `http://localhost:3000/comandos` | Página de comandos |
| `http://localhost:3000/api/config` | API de configuración |
| `http://localhost:3000/api/data` | API de datos |
| `http://localhost:3000/api/summary` | API de resumen |

---

## 🐛 Si algo no funciona

### Error: "relation 'config' does not exist"
→ No ejecutaste el schema SQL. Ve al Paso 1.

### Error: "Missing NEXT_PUBLIC_SUPABASE_URL"
→ Verifica que `.env.local` existe en la raíz del proyecto.

### Los datos no se cargan
→ Ejecuta `npx tsx scripts/test-supabase.ts` para diagnosticar.

### El servidor no inicia
→ Ejecuta `npm install` nuevamente.

---

## 📚 Documentación Completa

Para más detalles, lee:
- `RESUMEN_INTEGRACION.md` - Resumen completo
- `SUPABASE_SETUP_FINAL.md` - Guía detallada
- `INTEGRACION_SUPABASE_COMPLETA.md` - Documentación técnica

---

## 🎉 ¡Éxito!

Tu aplicación está lista para usar Supabase.

**Próximo paso:** Ejecuta el schema SQL en Supabase (Paso 1)

