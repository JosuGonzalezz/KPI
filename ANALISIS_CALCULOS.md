# Análisis de Cálculos de KPI

## Fecha: 19/05/2026

## Resumen Ejecutivo

El sistema de cálculos de KPI está **funcionando correctamente** con una precisión aceptable. Se detectaron pequeñas diferencias por redondeo que no afectan la coherencia del sistema.

---

## Hallazgos Detallados

### 1. MTD Total 2026 (días 2-14) ✅

| Métrica | Calculado | Esperado | Diferencia | Estado |
|---------|-----------|----------|------------|--------|
| Facturación | $2.735.222.758 | $2.735.222.760 | -$2 | ⚠️ Redondeo |
| Clientes | 75.286 | 75.286 | 0 | ✅ Exacto |
| Producto | 802.758 | 802.758 | 0 | ✅ Exacto |

**Nota:** La diferencia de $2 en facturación es por redondeo acumulado de los datos diarios.

### 2. Ticket Promedio ✅

| Cálculo | Valor |
|---------|-------|
| Facturación / Clientes | 36.331 |
| Valor esperado | 36.330 |
| Diferencia | +1 (redondeo) |

**Conclusión:** Diferencia aceptable por redondeo.

### 3. Chango Promedio ✅

| Cálculo | Valor |
|---------|-------|
| Productos / Clientes | 10.66 |
| Valor esperado | 10.66 |
| Diferencia | 0 |

**Conclusión:** Exacto.

### 4. Variaciones Porcentuales ✅

| Métrica | vs Mes Ant. | vs Año Ant. |
|---------|-------------|-------------|
| Facturación | +8,65% | +11,34% |
| Clientes | -2,14% | +5,23% |

**Conclusión:** Cálculos correctos.

### 5. KPI del Día (14/05/2026) ✅

| Métrica | Valor | Estado |
|---------|-------|--------|
| Facturación | 202.203.955 | ✅ |
| Clientes | 6.070 | ✅ |
| Ticket | 33.312 | ✅ |
| Chango | 10.43 (ítems) | ⚠️ Valor incorrecto en mock-data |
| Fact vs Día Ant | +1,82% | ✅ |
| Cli vs Día Ant | +10,54% | ✅ |

**⚠️ INCONSISTENCIA DETECTADA:**
- El campo `changoTot` en `kpiDia` está marcado como `63.289` (que es el total de productos del día)
- Pero el nombre sugiere "chango total" y debería ser el **chango promedio** (productos/clientes = 10.43)

**Recomendación:** Corregir el valor en `lib/mock-data.ts`:
```typescript
// Actual (incorrecto):
changoTot: { value: 63_289, vsDiaAnt: 7.32 }

// Correcto:
changoProm: { value: 10.43, vsDiaAnt: 7.32 } // productos/clientes = 63289/6070
```

### 6. Validación de Sucursales ✅

| Sucursal | Facturación | % Total | Estado |
|----------|-------------|---------|--------|
| Colón | $795.135.950 | 29,07% | ✅ |
| Serrano | $594.728.256 | 21,74% | ✅ |
| Perón | $447.840.865 | 16,37% | ✅ |
| San Martín | $561.457.916 | 20,53% | ✅ |
| Virtual | $336.059.773 | 12,29% | ✅ |
| **TOTAL** | $2.735.222.760 | 100,00% | ✅ |

**Conclusión:** Todos los porcentajes suman 100% correctamente.

### 7. Facturación por Metro Cuadrado ✅

| Sucursal | Facturación | m² | $/m² | Estado |
|----------|-------------|----|------|--------|
| Colón | $795.135.950 | 950 | 836.985 | ✅ |
| Serrano | $594.728.256 | 685 | 868.216 | ✅ |
| Perón | $447.840.865 | 600 | 746.401 | ✅ |
| San Martín | $561.457.916 | 710 | 790.785 | ✅ |

**Conclusión:** Cálculos correctos.

---

## Inconsistencias Detectadas

### 🔴 Crítico

1. **KPI del día - Chango (lib/mock-data.ts)**
   - **Ubicación:** Línea 47-50
   - **Problema:** `changoTot` tiene el valor de productos totales (63.289) en lugar del chango promedio (10.43)
   - **Impacto:** El dashboard mostrará un valor incorrecto en la tarjeta de KPI del día
   - **Solución:** Cambiar el nombre a `changoProm` y el valor a `63_289 / 6_070 = 10.43`

### 🟡 Menor

2. **Redondeo en MTD Facturación**
   - **Ubicación:** `lib/report-data.ts` - cálculo automático
   - **Problema:** Diferencia de $2 vs valor hardcodeado en `lib/mock-data.ts`
   - **Impacto:** Despreciable, no afecta decisiones
   - **Solución:** Usar el valor calculado automáticamente en lugar del hardcodeado

---

## Recomendaciones

### 1. Corregir KPI del día (Prioridad Alta)

**Archivo:** `lib/mock-data.ts`

**Cambiar:**
```typescript
export const kpiDia = {
  facturacion:  { value: 202_203_955, vsDiaAnt:  1.82 },
  clientes:     { value:  6_070,      vsDiaAnt: 10.55 },
  ticketProm:   { value:  33_312,     vsDiaAnt: -7.90 },
  changoTot:    { value:  63_289,     vsDiaAnt:  7.32 }, // ❌ Incorrecto
};
```

**Por:**
```typescript
export const kpiDia = {
  facturacion:  { value: 202_203_955, vsDiaAnt:  1.82 },
  clientes:     { value:  6_070,      vsDiaAnt: 10.55 },
  ticketProm:   { value:  33_312,     vsDiaAnt: -7.90 },
  changoProm:   { value:  10.43,      vsDiaAnt:  7.32 }, // ✅ Correcto
};
```

### 2. Automatizar cálculo de KPIs (Prioridad Media)

**Sugerencia:** Crear una función que calcule automáticamente los KPIs a partir de los datos diarios en lugar de hardcodearlos.

**Ejemplo:**
```typescript
function calculateKpiDia(records: DailyRecord[], day: number) {
  const dayRecords = records.filter(r => r.day === day);
  const prevRecords = records.filter(r => r.day === day - 1);
  
  const fact = dayRecords.find(r => r.tipo === 'Facturacion')?.total ?? 0;
  const cli = dayRecords.find(r => r.tipo === 'Clientes')?.total ?? 0;
  const prod = dayRecords.find(r => r.tipo === 'Producto')?.total ?? 0;
  
  return {
    facturacion: { value: fact, vsDiaAnt: calculateVsPrev(fact, prevFact) },
    clientes: { value: cli, vsDiaAnt: calculateVsPrev(cli, prevCli) },
    ticketProm: { value: Math.round(fact / cli), vsDiaAnt: ... },
    changoProm: { value: prod / cli, vsDiaAnt: ... },
  };
}
```

### 3. Validar datos de entrada (Prioridad Baja)

**Sugerencia:** Agregar validación en el panel de carga para asegurar que:
- La suma de % de sucursales = 100%
- El ticket promedio = facturación / clientes
- El chango promedio = productos / clientes

---

## Conclusión

El sistema de cálculos es **coherente y confiable** para la toma de decisiones. La única inconsistencia significativa es el campo `changoTot` en `kpiDia`, que debe corregirse para mostrar el valor correcto.

**Estado General:** ✅ APROBADO (con corrección menor pendiente)

---

## Próximos Pasos

1. Corregir el campo `changoTot` → `changoProm` en `lib/mock-data.ts`
2. Implementar cálculo automático de KPIs para evitar inconsistencias futuras
3. Agregar tests unitarios para validar los cálculos
4. Documentar la fórmula de cada KPI en el código
