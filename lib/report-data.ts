// ============================================================
// REPORT DATA — Estructura de datos diarios por sucursal
// Tabla: Fecha | Colón | Serrano | Perón | San Martín | Virtual | Total | Tipo
// Preparado para integración futura con Supabase
// ============================================================

export type TipoMetrica = 'Clientes' | 'Producto' | 'Facturacion';
export const BRANCH_KEYS = ['colon', 'serrano', 'peron', 'sanMartin', 'virtual'] as const;
export type BranchKey = typeof BRANCH_KEYS[number];

export const BRANCH_LABELS: Record<BranchKey, string> = {
  colon:     'Colón',
  serrano:   'Serrano',
  peron:     'Perón',
  sanMartin: 'San Martín',
  virtual:   'Virtual',
};

export type DailyRecord = {
  fecha:     string;        // "DD.MM.YYYY"
  year:      number;
  month:     number;
  day:       number;
  colon:     number | null;
  serrano:   number | null;
  peron:     number | null;
  sanMartin: number | null;
  virtual:   number | null;
  total:     number;
  tipo:      TipoMetrica;
};

// ── Mayo 2026 — Datos reales del reporte diario ───────────────
// May 1, 2026 = Thursday (not in source data)
// May 2, 2026 = Friday ... May 14, 2026 = Wednesday
export const may2026: DailyRecord[] = [
  // ── CLIENTES ─────────────────────────────────────────────────
  { fecha: '02.05.2026', year: 2026, month: 5, day:  2, colon: 1928, serrano: 1510, peron: 1505, sanMartin: 1934, virtual:  429, total:  7306, tipo: 'Clientes' },
  { fecha: '03.05.2026', year: 2026, month: 5, day:  3, colon: 1614, serrano: 1105, peron: 1102, sanMartin: 1172, virtual: null, total:  4993, tipo: 'Clientes' },
  { fecha: '04.05.2026', year: 2026, month: 5, day:  4, colon: 1332, serrano: 1037, peron: 1040, sanMartin: 1605, virtual:  439, total:  5453, tipo: 'Clientes' },
  { fecha: '05.05.2026', year: 2026, month: 5, day:  5, colon: 1682, serrano: 1114, peron: 1151, sanMartin: 1759, virtual:  433, total:  6139, tipo: 'Clientes' },
  { fecha: '06.05.2026', year: 2026, month: 5, day:  6, colon: 1319, serrano:  968, peron: 1006, sanMartin: 1417, virtual:  464, total:  5174, tipo: 'Clientes' },
  { fecha: '07.05.2026', year: 2026, month: 5, day:  7, colon: 1601, serrano: 1134, peron: 1199, sanMartin: 1770, virtual:  359, total:  6063, tipo: 'Clientes' },
  { fecha: '08.05.2026', year: 2026, month: 5, day:  8, colon: 1540, serrano: 1196, peron: 1136, sanMartin: 1577, virtual:  320, total:  5769, tipo: 'Clientes' },
  { fecha: '09.05.2026', year: 2026, month: 5, day:  9, colon: 1656, serrano: 1354, peron: 1279, sanMartin: 1734, virtual:  406, total:  6429, tipo: 'Clientes' },
  { fecha: '10.05.2026', year: 2026, month: 5, day: 10, colon: 1605, serrano: 1125, peron: 1068, sanMartin: 1142, virtual: null, total:  4940, tipo: 'Clientes' },
  { fecha: '11.05.2026', year: 2026, month: 5, day: 11, colon: 1379, serrano:  991, peron: 1019, sanMartin: 1768, virtual:  360, total:  5517, tipo: 'Clientes' },
  { fecha: '12.05.2026', year: 2026, month: 5, day: 12, colon: 1612, serrano: 1091, peron: 1131, sanMartin: 1707, virtual:  401, total:  5942, tipo: 'Clientes' },
  { fecha: '13.05.2026', year: 2026, month: 5, day: 13, colon: 1408, serrano: 1030, peron:  995, sanMartin: 1665, virtual:  393, total:  5491, tipo: 'Clientes' },
  { fecha: '14.05.2026', year: 2026, month: 5, day: 14, colon: 1558, serrano: 1223, peron: 1186, sanMartin: 1790, virtual:  313, total:  6070, tipo: 'Clientes' },

  // ── PRODUCTO (unidades/ítems) ─────────────────────────────────
  { fecha: '02.05.2026', year: 2026, month: 5, day:  2, colon: 24362, serrano: 17302, peron: 14584, sanMartin: 17673, virtual: 10670, total:  84591, tipo: 'Producto' },
  { fecha: '03.05.2026', year: 2026, month: 5, day:  3, colon: 19177, serrano: 11154, peron:  9595, sanMartin:  9159, virtual:  null, total:  49085, tipo: 'Producto' },
  { fecha: '04.05.2026', year: 2026, month: 5, day:  4, colon: 13981, serrano: 11474, peron:  8946, sanMartin: 11703, virtual: 10437, total:  56541, tipo: 'Producto' },
  { fecha: '05.05.2026', year: 2026, month: 5, day:  5, colon: 19105, serrano: 12611, peron: 10268, sanMartin: 14505, virtual: 10103, total:  66592, tipo: 'Producto' },
  { fecha: '06.05.2026', year: 2026, month: 5, day:  6, colon: 14520, serrano: 10655, peron:  8826, sanMartin: 11044, virtual: 10415, total:  55460, tipo: 'Producto' },
  { fecha: '07.05.2026', year: 2026, month: 5, day:  7, colon: 18988, serrano: 12753, peron: 11145, sanMartin: 14751, virtual:  7948, total:  65585, tipo: 'Producto' },
  { fecha: '08.05.2026', year: 2026, month: 5, day:  8, colon: 17936, serrano: 13774, peron: 10540, sanMartin: 13400, virtual:  7308, total:  62958, tipo: 'Producto' },
  { fecha: '09.05.2026', year: 2026, month: 5, day:  9, colon: 20679, serrano: 15382, peron: 12712, sanMartin: 16421, virtual:  8746, total:  73940, tipo: 'Producto' },
  { fecha: '10.05.2026', year: 2026, month: 5, day: 10, colon: 17527, serrano: 11284, peron:  9147, sanMartin:  8837, virtual:  null, total:  46795, tipo: 'Producto' },
  { fecha: '11.05.2026', year: 2026, month: 5, day: 11, colon: 15002, serrano: 10524, peron:  8645, sanMartin: 13288, virtual:  7805, total:  55264, tipo: 'Producto' },
  { fecha: '12.05.2026', year: 2026, month: 5, day: 12, colon: 18796, serrano: 12016, peron: 10351, sanMartin: 13865, virtual:  8658, total:  63686, tipo: 'Producto' },
  { fecha: '13.05.2026', year: 2026, month: 5, day: 13, colon: 17651, serrano: 11415, peron:  8638, sanMartin: 12805, virtual:  8463, total:  58972, tipo: 'Producto' },
  { fecha: '14.05.2026', year: 2026, month: 5, day: 14, colon: 18315, serrano: 12826, peron: 10712, sanMartin: 14487, virtual:  6949, total:  63289, tipo: 'Producto' },

  // ── FACTURACION ───────────────────────────────────────────────
  { fecha: '02.05.2026', year: 2026, month: 5, day:  2, colon:  89454093, serrano: 69377080, peron: 53066669, sanMartin: 62299555, virtual: 40909449, total: 315106846, tipo: 'Facturacion' },
  { fecha: '03.05.2026', year: 2026, month: 5, day:  3, colon:  65916931, serrano: 41385011, peron: 32198704, sanMartin: 31846579, virtual:     null, total: 171347225, tipo: 'Facturacion' },
  { fecha: '04.05.2026', year: 2026, month: 5, day:  4, colon:  46572527, serrano: 40784020, peron: 27583737, sanMartin: 37666683, virtual: 34838176, total: 187445143, tipo: 'Facturacion' },
  { fecha: '05.05.2026', year: 2026, month: 5, day:  5, colon:  60886098, serrano: 42779212, peron: 32307346, sanMartin: 45066389, virtual: 34230745, total: 215269790, tipo: 'Facturacion' },
  { fecha: '06.05.2026', year: 2026, month: 5, day:  6, colon:  48406189, serrano: 38149348, peron: 29836097, sanMartin: 35221794, virtual: 35885750, total: 187499178, tipo: 'Facturacion' },
  { fecha: '07.05.2026', year: 2026, month: 5, day:  7, colon:  59331613, serrano: 43898311, peron: 34081590, sanMartin: 44944381, virtual: 27441977, total: 209697872, tipo: 'Facturacion' },
  { fecha: '08.05.2026', year: 2026, month: 5, day:  8, colon:  63571951, serrano: 51204533, peron: 37084526, sanMartin: 45881687, virtual: 24558095, total: 222300792, tipo: 'Facturacion' },
  { fecha: '09.05.2026', year: 2026, month: 5, day:  9, colon:  76471331, serrano: 60847584, peron: 46140963, sanMartin: 57319076, virtual: 28385668, total: 269164622, tipo: 'Facturacion' },
  { fecha: '10.05.2026', year: 2026, month: 5, day: 10, colon:  64518632, serrano: 44121431, peron: 32054420, sanMartin: 31003404, virtual:     null, total: 171697887, tipo: 'Facturacion' },
  { fecha: '11.05.2026', year: 2026, month: 5, day: 11, colon:  47047955, serrano: 36787045, peron: 28953588, sanMartin: 41860335, virtual: 26073418, total: 180722341, tipo: 'Facturacion' },
  { fecha: '12.05.2026', year: 2026, month: 5, day: 12, colon:  57976725, serrano: 41306080, peron: 32673625, sanMartin: 42260289, virtual: 29969159, total: 204185878, tipo: 'Facturacion' },
  { fecha: '13.05.2026', year: 2026, month: 5, day: 13, colon:  57220009, serrano: 40843917, peron: 28780920, sanMartin: 41964018, virtual: 29772365, total: 198581229, tipo: 'Facturacion' },
  { fecha: '14.05.2026', year: 2026, month: 5, day: 14, colon:  57761896, serrano: 43244684, peron: 33078680, sanMartin: 44123726, virtual: 23994969, total: 202203955, tipo: 'Facturacion' },
];

// ── Simulación Mayo 2025 — Mes anterior al actual ─────────────
// May 1, 2025 = Thursday (same day-of-week alignment as May 2026)
// Base: ~11% menos en Facturación, ~5% menos en Clientes, ~7% menos en Producto
// Generado con seeded-random para evitar hydration mismatch
function sr(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return (x - Math.floor(x));
}

// Branch distribution shares (stable)
const SHARES = {
  colon:     [0.291, 0.264, 0.268],   // [facturacion, clientes, producto]
  serrano:   [0.217, 0.197, 0.202],
  peron:     [0.163, 0.197, 0.164],
  sanMartin: [0.205, 0.279, 0.200],
  virtual:   [0.124, 0.063, 0.166],
};

function buildMay2025(): DailyRecord[] {
  const records: DailyRecord[] = [];
  // May 1, 2025 = Thursday → index in week: 4 (0=Sun)
  // Day-of-week multipliers relative to average
  const DOW_FACT = [0.60, 0.82, 0.90, 0.93, 0.97, 1.14, 1.48]; // Sun..Sat
  const DOW_CLI  = [0.58, 0.84, 0.91, 0.92, 0.97, 1.12, 1.45];

  // Base daily averages (2025 level)
  const baseF   = 185_500_000; // avg daily Facturación 2025
  const baseCli = 5_310;       // avg daily Clientes 2025
  const basePro = 56_620;      // avg daily Productos 2025

  for (let day = 1; day <= 31; day++) {
    const dow   = (4 + day - 1) % 7; // 4 = Thursday offset
    const isVirtualDay = dow !== 0;  // no virtual on Sundays
    const noiseF   = 0.90 + sr(day * 3)     * 0.20;
    const noiseCli = 0.91 + sr(day * 3 + 1) * 0.18;
    const noisePro = 0.91 + sr(day * 3 + 2) * 0.18;

    const dayF   = Math.round(baseF   * DOW_FACT[dow] * noiseF);
    const dayCli = Math.round(baseCli * DOW_CLI[dow]  * noiseCli);
    const dayPro = Math.round(basePro * DOW_FACT[dow]  * noisePro);

    const fecha = `${String(day).padStart(2, '0')}.05.2025`;
    const branchNoise = (b: number) => 0.97 + sr(day * 7 + b) * 0.06;

    // Facturación
    const colonF     = Math.round(dayF * SHARES.colon[0]     * branchNoise(1));
    const serranoF   = Math.round(dayF * SHARES.serrano[0]   * branchNoise(2));
    const peronF     = Math.round(dayF * SHARES.peron[0]     * branchNoise(3));
    const sanMartinF = Math.round(dayF * SHARES.sanMartin[0] * branchNoise(4));
    const virtualF   = isVirtualDay ? Math.round(dayF * SHARES.virtual[0] * branchNoise(5)) : null;
    const totalF     = colonF + serranoF + peronF + sanMartinF + (virtualF ?? 0);

    // Clientes
    const colonC     = Math.round(dayCli * SHARES.colon[1]     * branchNoise(6));
    const serranoC   = Math.round(dayCli * SHARES.serrano[1]   * branchNoise(7));
    const peronC     = Math.round(dayCli * SHARES.peron[1]     * branchNoise(8));
    const sanMartinC = Math.round(dayCli * SHARES.sanMartin[1] * branchNoise(9));
    const virtualC   = isVirtualDay ? Math.round(dayCli * SHARES.virtual[1] * branchNoise(10)) : null;
    const totalC     = colonC + serranoC + peronC + sanMartinC + (virtualC ?? 0);

    // Producto
    const colonP     = Math.round(dayPro * SHARES.colon[2]     * branchNoise(11));
    const serranoP   = Math.round(dayPro * SHARES.serrano[2]   * branchNoise(12));
    const peronP     = Math.round(dayPro * SHARES.peron[2]     * branchNoise(13));
    const sanMartinP = Math.round(dayPro * SHARES.sanMartin[2] * branchNoise(14));
    const virtualP   = isVirtualDay ? Math.round(dayPro * SHARES.virtual[2] * branchNoise(15)) : null;
    const totalP     = colonP + serranoP + peronP + sanMartinP + (virtualP ?? 0);

    records.push(
      { fecha, year: 2025, month: 5, day, colon: colonF,     serrano: serranoF,   peron: peronF,     sanMartin: sanMartinF, virtual: virtualF, total: totalF, tipo: 'Facturacion' },
      { fecha, year: 2025, month: 5, day, colon: colonC,     serrano: serranoC,   peron: peronC,     sanMartin: sanMartinC, virtual: virtualC, total: totalC, tipo: 'Clientes'    },
      { fecha, year: 2025, month: 5, day, colon: colonP,     serrano: serranoP,   peron: peronP,     sanMartin: sanMartinP, virtual: virtualP, total: totalP, tipo: 'Producto'    },
    );
  }
  return records;
}

export const may2025: DailyRecord[] = buildMay2025();

// ── ÚLTIMO DÍA CARGADO ────────────────────────────────────────
export const LAST_DAY_2026 = 14; // día más reciente con datos en 2026

// ── HELPERS DE CÁLCULO ───────────────────────────────────────

/** Suma MTD de un año/mes hasta un día inclusivo */
export function calcMTD(
  records: DailyRecord[],
  year: number,
  tipo: TipoMetrica,
  upToDay: number
): number {
  return records
    .filter(r => r.year === year && r.tipo === tipo && r.day <= upToDay)
    .reduce((sum, r) => sum + r.total, 0);
}

/** MTD por sucursal hasta un día inclusivo */
export function calcMTDByBranch(
  records: DailyRecord[],
  year: number,
  tipo: TipoMetrica,
  upToDay: number
): Record<BranchKey, number> {
  const result: Record<BranchKey, number> = {
    colon: 0, serrano: 0, peron: 0, sanMartin: 0, virtual: 0
  };
  records
    .filter(r => r.year === year && r.tipo === tipo && r.day <= upToDay)
    .forEach(r => {
      (Object.keys(result) as BranchKey[]).forEach(k => {
        if (r[k] !== null) result[k] += r[k] as number;
      });
    });
  return result;
}

/** Serie acumulada día a día para gráfico de progresión (días 1..maxDay) */
export function calcCumulativeSeries(
  records: DailyRecord[],
  year: number,
  tipo: TipoMetrica,
  maxDay: number
): { day: number; cumul: number }[] {
  const series: { day: number; cumul: number }[] = [];
  let acc = 0;
  for (let d = 1; d <= maxDay; d++) {
    const dayTotal = records
      .filter(r => r.year === year && r.tipo === tipo && r.day === d)
      .reduce((s, r) => s + r.total, 0);
    acc += dayTotal;
    series.push({ day: d, cumul: acc });
  }
  return series;
}

// ── PRE-COMPUTED MTD VALUES ───────────────────────────────────
// Mayo 2026 MTD real (días 2–14, May 1 no cargado)
export const MTD_2026 = {
  facturacion: calcMTD([...may2026], 2026, 'Facturacion', LAST_DAY_2026),
  clientes:    calcMTD([...may2026], 2026, 'Clientes',    LAST_DAY_2026),
  producto:    calcMTD([...may2026], 2026, 'Producto',    LAST_DAY_2026),
};

// Mayo 2025 MTD mismo período (días 1–14)
export const MTD_2025 = {
  facturacion: calcMTD([...may2025], 2025, 'Facturacion', LAST_DAY_2026),
  clientes:    calcMTD([...may2025], 2025, 'Clientes',    LAST_DAY_2026),
  producto:    calcMTD([...may2025], 2025, 'Producto',    LAST_DAY_2026),
};

// Por sucursal MTD
export const MTD_BRANCH_2026_FACT = calcMTDByBranch([...may2026], 2026, 'Facturacion', LAST_DAY_2026);
export const MTD_BRANCH_2025_FACT = calcMTDByBranch([...may2025], 2025, 'Facturacion', LAST_DAY_2026);
export const MTD_BRANCH_2026_CLI  = calcMTDByBranch([...may2026], 2026, 'Clientes',    LAST_DAY_2026);
export const MTD_BRANCH_2025_CLI  = calcMTDByBranch([...may2025], 2025, 'Clientes',    LAST_DAY_2026);

// Series para el gráfico de progresión acumulada
export const CUMUL_FACT_2026 = calcCumulativeSeries([...may2026], 2026, 'Facturacion', LAST_DAY_2026);
export const CUMUL_FACT_2025 = calcCumulativeSeries([...may2025], 2025, 'Facturacion', LAST_DAY_2026);
export const CUMUL_CLI_2026  = calcCumulativeSeries([...may2026], 2026, 'Clientes',    LAST_DAY_2026);
export const CUMUL_CLI_2025  = calcCumulativeSeries([...may2025], 2025, 'Clientes',    LAST_DAY_2026);
export const CUMUL_PRO_2026  = calcCumulativeSeries([...may2026], 2026, 'Producto',    LAST_DAY_2026);
export const CUMUL_PRO_2025  = calcCumulativeSeries([...may2025], 2025, 'Producto',    LAST_DAY_2026);
