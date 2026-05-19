# Nuevo Sistema de Totales Mensuales

## 🎯 Cambio de enfoque

### Antes (problemático)
- Cargar datos diarios para todos los meses
- Sistema complejo y propenso a errores
- Difícil de mantener

### Ahora (simplificado)
- **Totales mensuales** para meses cerrados (mes anterior y mismo mes año anterior)
- **Datos diarios** solo para el mes en curso
- Sistema simple y fácil de usar

---

## 📋 Paso 1: Actualizar Supabase

Necesitas ejecutar el SQL actualizado en tu base de datos Supabase:

### Cómo hacerlo:
1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Haz clic en "SQL Editor" en el menú lateral
3. Copia y pega el contenido del archivo `supabase-schema.sql`
4. Haz clic en "Run" para ejecutar

### Qué hace:
- ✅ Crea la tabla `monthly_totals` para totales mensuales
- ✅ Agrega campos a `config` para configurar períodos de comparación
- ✅ Crea índices para mejor performance
- ✅ Configura políticas de seguridad (RLS)

---

## 📊 Estructura de datos

### Totales mensuales (monthly_totals)
```
Fecha | Colón | Serrano | Perón | San Martín | Virtual | Total | Tipo
Abril | 57761896 | 43244684 | 33078680 | 44123726 | 23994968 | 202203955 | Facturacion
Abril | 57220008 | 40843916 | 28780919 | 41964017 | 29772365 | 198581228 | Clientes
Abril | 57976725 | 41306079 | 32673624 | 42260289 | 29969158 | 204185878 | Productos
```

**Características:**
- 3 filas por mes (Facturacion, Clientes, Productos)
- Nombre del mes en la columna "Fecha"
- Totales del mes completo

### Datos diarios (daily_records)
```
Fecha | Colón | Serrano | Perón | San Martín | Virtual | Total | Tipo
14.05.2026 | 57761896 | 43244684 | 33078680 | 44123726 | 23994968 | 202203955 | Facturacion
14.05.2026 | 18315 | 12826 | 10712 | 14487 | 6949 | 63289 | Producto
14.05.2026 | 1558 | 1223 | 1186 | 1790 | 313 | 6070 | Clientes
```

**Características:**
- Datos día por día
- Solo para el mes en curso
- Fecha en formato DD.MM.YYYY

---

## 🔧 Cómo usar el nuevo sistema

### 1. Configurar período activo
```
Panel de Comandos → Período activo del dashboard
- Año: 2026
- Mes en curso: Mayo
- Hasta el día: 14
- Mes anterior: Abril 2026
- Mismo mes año anterior: Mayo 2025
```

### 2. Cargar totales del mes anterior
```
1. Haz clic en "Descargar plantilla" (Mes anterior)
2. Se descarga: Totales_Abril_2026.csv
3. Abre en Excel y completa los 3 totales:
   - Facturacion
   - Clientes
   - Productos
4. Haz clic en "Cargar CSV"
5. Confirma la carga
```

### 3. Cargar totales del mismo mes año anterior
```
1. Haz clic en "Descargar plantilla" (Mismo mes año anterior)
2. Se descarga: Totales_Mayo_2025.csv
3. Abre en Excel y completa los 3 totales
4. Haz clic en "Cargar CSV"
5. Confirma la carga
```

### 4. Cargar datos diarios del mes en curso
```
1. Usa la sección "Cargar archivo CSV"
2. Carga datos día por día
3. El sistema calcula automáticamente las métricas
```

---

## 🆕 Nuevos API endpoints

### GET /api/monthly-totals
```
GET /api/monthly-totals?year=2025&month=4

Respuesta:
{
  "totals": [
    {
      "year": 2025,
      "month": 4,
      "month_name": "Abril",
      "colon": 57761896,
      "serrano": 43244684,
      "peron": 33078680,
      "san_martin": 44123726,
      "virtual": 23994968,
      "total": 202203955,
      "tipo": "Facturacion"
    },
    ...
  ]
}
```

### POST /api/monthly-totals
```
POST /api/monthly-totals
Body: {
  "csvText": "Fecha\tColón\t...",
  "year": 2025,
  "month": 4
}

Respuesta:
{
  "ok": true,
  "inserted": 3,
  "errors": []
}
```

### GET /api/export-monthly-template
```
GET /api/export-monthly-template?year=2025&month=4&monthName=Abril

Descarga: Totales_Abril_2025.csv
```

---

## 📝 Formato de plantilla mensual

```csv
Fecha	Colón	Serrano	Perón	San Martín	Virtual	Total	Tipo
Abril	57761896	43244684	33078680	44123726	23994968	202203955	Facturacion
Abril	57220008	40843916	28780919	41964017	29772365	198581228	Clientes
Abril	57976725	41306079	32673624	42260289	29969158	204185878	Productos
```

**Importante:**
- Separador: Tabulación (TAB)
- Fecha: Nombre del mes (ej: "Abril")
- Tipo: Facturacion, Clientes o Productos
- Números: Sin formato (ej: 57761896)

---

## ✅ Ventajas del nuevo sistema

1. **Más simple**: Solo 3 filas por mes cerrado
2. **Menos errores**: No necesitas cargar 30+ días por mes
3. **Más rápido**: Carga instantánea
4. **Más claro**: Estructura obvia y fácil de entender
5. **Más flexible**: Puedes actualizar totales fácilmente

---

## 🔄 Flujo completo

```
1. Actualizar Supabase (ejecutar supabase-schema.sql)
   ↓
2. Configurar período activo en Panel de Comandos
   ↓
3. Descargar plantilla para mes anterior
   ↓
4. Completar 3 filas (Facturacion, Clientes, Productos)
   ↓
5. Cargar CSV del mes anterior
   ↓
6. Descargar plantilla para mismo mes año anterior
   ↓
7. Completar 3 filas
   ↓
8. Cargar CSV del mismo mes año anterior
   ↓
9. Cargar datos diarios del mes en curso
   ↓
10. ✅ Sistema calcula objetivos automáticamente
```

---

## 🚨 Próximos pasos

1. **Actualizar Supabase** con el nuevo schema
2. **Esperar redeploy de Vercel** (2-3 minutos)
3. **Actualizar Panel de Comandos** para usar el nuevo sistema
4. **Probar carga de totales mensuales**

---

**Última actualización**: Mayo 2026
**Estado**: En desarrollo
**Versión**: 3.0.0
