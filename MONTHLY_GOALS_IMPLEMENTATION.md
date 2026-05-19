# 📊 Sistema de Objetivos del Mes - Implementación

## 🎯 Concepto

El sistema calcula objetivos mensuales basados en el porcentaje transcurrido del mes actual, comparando contra:
1. **Mes anterior** (con datos completos)
2. **Mismo mes del año anterior** (con datos completos)

### Fórmula

```
Porcentaje Transcurrido = (Días Transcurridos / Días Totales del Mes) × 100

Objetivo = Total Mes Anterior × Porcentaje Transcurrido
```

### Ejemplo

**Hoy es 19 de mayo (31 días totales):**
- Porcentaje transcurrido = (19 / 31) × 100 = 61.3%

**Abril 2026 tuvo $1,000,000 en facturación:**
- Objetivo = $1,000,000 × 61.3% = $613,000

**Mayo 2026 actual (hasta hoy):**
- Facturación actual = $620,000
- Progreso = ($620,000 / $613,000) × 100 = 101.1% ✅

---

## 🏗️ Arquitectura

### 1. Funciones en `lib/supabase-store.ts`

#### `getMonthlyTotals(year, month)`
Calcula los totales de un mes completo por tipo de métrica y sucursal.

```typescript
export async function getMonthlyTotals(
  year: number,
  month: number
): Promise<MonthlyTotals>
```

**Retorna:**
```typescript
{
  facturacion: number;
  clientes: number;
  producto: number;
  byBranch: {
    colon: { facturacion, clientes, producto };
    serrano: { facturacion, clientes, producto };
    peron: { facturacion, clientes, producto };
    san_martin: { facturacion, clientes, producto };
    virtual: { facturacion, clientes, producto };
  };
}
```

#### `calculateMonthlyGoals(currentYear, currentMonth, currentDay, daysInMonth)`
Calcula los objetivos basados en el porcentaje transcurrido.

```typescript
export async function calculateMonthlyGoals(
  currentYear: number,
  currentMonth: number,
  currentDay: number,
  daysInMonth: number
)
```

**Retorna:**
```typescript
{
  percentageTranscurred: number;
  prevMonthGoals: MonthlyTotals;
  sameMonthLastYearGoals: MonthlyTotals;
}
```

### 2. Ruta API `/api/monthly-goals`

#### POST - Calcular Objetivos
```bash
POST /api/monthly-goals
Content-Type: application/json

{
  "currentYear": 2026,
  "currentMonth": 5,
  "currentDay": 19,
  "daysInMonth": 31
}
```

**Respuesta:**
```json
{
  "percentageTranscurred": 61.3,
  "prevMonthGoals": { ... },
  "sameMonthLastYearGoals": { ... },
  "currentMonthActual": { ... }
}
```

#### PUT - Guardar Totales Manuales
```bash
PUT /api/monthly-goals
Content-Type: application/json

{
  "year": 2026,
  "month": 5,
  "totals": {
    "facturacion": 1000000,
    "clientes": 5000,
    "producto": 50000,
    "byBranch": { ... }
  }
}
```

### 3. Componente `MonthlyGoals`

Muestra:
- **Gauges de progreso** para Facturación, Clientes y Producto
- **Porcentaje transcurrido** del mes
- **Panel de sucursales** con detalles por rama

**Props:**
```typescript
interface MonthlyGoalsProps {
  currentDay: number;
  currentMonth: number;
  currentYear: number;
  daysInMonth: number;
}
```

---

## 📋 Flujo de Datos

```
Dashboard (app/page.tsx)
    ↓
MonthlyGoals Component
    ↓
fetch /api/monthly-goals (POST)
    ↓
calculateMonthlyGoals()
    ├─ getMonthlyTotals(prevMonth)
    ├─ getMonthlyTotals(sameMonthLastYear)
    ├─ getRecordsByYearMonth(currentMonth)
    └─ Calcular porcentaje y aplicar
    ↓
Retornar objetivos y datos actuales
    ↓
Renderizar gauges y panel de sucursales
```

---

## 🎨 Componentes Visuales

### Gauges de Progreso
- **Verde:** ≥ 100% del objetivo
- **Amarillo:** 85-99% del objetivo
- **Rojo:** < 85% del objetivo

### Panel de Sucursales
Muestra para cada sucursal:
- 🕐 Icono de reloj
- Facturación (en K)
- Clientes
- Producto

---

## 🔧 Configuración

### Días del Mes
Actualmente configurado en `app/page.tsx`:
```typescript
const daysInMonth = 31; // Cambiar según el mes
```

**Valores por mes:**
- Enero, Marzo, Mayo, Julio, Agosto, Octubre, Diciembre: 31
- Abril, Junio, Septiembre, Noviembre: 30
- Febrero: 28 (29 en años bisiestos)

### Fecha Actual
```typescript
const currentDay = 19;
const currentMonth = 5;
const currentYear = 2026;
```

---

## 📊 Métricas Soportadas

- ✅ Facturación
- ✅ Clientes
- ✅ Producto

Todas con desglose por sucursal:
- Colón
- Serrano
- Perón
- San Martín
- Virtual

---

## 🚀 Próximas Mejoras

1. **Panel de Comandos**
   - Selector de mes actual
   - Carga manual de datos
   - Edición de objetivos

2. **Persistencia**
   - Guardar totales mensuales en tabla
   - Historial de objetivos

3. **Análisis**
   - Comparativa histórica
   - Tendencias mensuales
   - Proyecciones

4. **Alertas**
   - Notificación si se alcanza objetivo
   - Alerta si se va por debajo

---

## 📝 Notas Técnicas

- Todas las funciones son `async` y usan `'use server'`
- Los cálculos se hacen en el servidor (seguro)
- Los datos se cachean en el cliente (rápido)
- Soporta carga manual de datos para meses cerrados

---

## 🔗 Archivos Relacionados

- `lib/supabase-store.ts` - Funciones de cálculo
- `app/api/monthly-goals/route.ts` - Ruta API
- `components/dashboard/MonthlyGoals.tsx` - Componente visual
- `components/dashboard/MonthlyGoalsPanel.tsx` - Panel de comandos (futuro)
- `app/page.tsx` - Dashboard principal

