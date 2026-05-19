// ============================================================
// MOCK DATA — Dashboard Ejecutivo | Cadena de Supermercados
// Estructura basada en Reporte de sucursales 14/05/2026
// Replace these values with your real data source later.
// ============================================================

export const REPORT_DATE    = "15/05/2026";
export const REPORT_TIME    = "17:03";
export const REPORT_PERIODO = "Mayo 2026";
export const TEMP_MAX       = 19;
export const TEMP_MIN       = 9;

// ── KPIs acumulados del mes a la fecha ──────────────────────
// Facturación MTD real (días 2–14 = 13 días cargados)
// Suma de facturación diaria: $2.735.222.760
export const kpiMes = {
  facturacion: {
    acumulado:  2_735_222_760,
    metaMes:    6_500_000_000,  // objetivo mensual estimado (31 días)
    vsMesAnt:   8.65,           // % vs mismo período mes anterior
    vsAA:       11.34,          // % vs mismo período año anterior (vs simulado 2025)
  },
  clientes: {
    acumulado:  75_286,         // suma real días 2–14
    metaMes:    175_000,        // objetivo mensual estimado
    vsMesAnt:  -2.14,
    vsAA:        5.23,
  },
  ticketPromedio: {
    acumulado:   36_330,        // facturacion / clientes = promedio
    metaMes:     37_000,
    vsMesAnt:    5.82,
    vsAA:        5.80,
  },
  productos: {
    acumulado:  802_758,        // suma real días 2–14
    metaMes:  1_900_000,
    vsMesAnt:  -1.2,
    vsAA:       7.42,
  },
  changoPromedio: {
    acumulado:   10.66,         // productos / clientes
    metaMes:     10.86,
    vsMesAnt:   -3.50,
    vsAA:        2.10,
  },
};

// ── KPI del día — último cargado: 14/05/2026 ────────────────
// Día 14: fact=202.203.955 | clientes=6.070 | productos=63.289
// Día 13: fact=198.581.229 | clientes=5.491 | productos=58.972
export const kpiDia = {
  facturacion:  { value: 202_203_955, vsDiaAnt:  1.82 },  // (202M - 198M) / 198M
  clientes:     { value:  6_070,      vsDiaAnt: 10.55 },  // (6070 - 5491) / 5491
  ticketProm:   { value:  33_312,     vsDiaAnt: -7.90 },  // ticket promedio día 14 (202203955/6070)
  changoProm:   { value:  10.43,      vsDiaAnt:  7.32 },  // productos/clientes (63289/6070)
};

// ── Tabla comparativa de sucursales ─────────────────────────
export type BranchRow = {
  name:           string;
  // Facturación
  facturacion:    number;
  pctTotal:       number;   // % sobre el total cadena
  vsMesAnt:       number;   // % vs mismo período mes anterior
  vsAA:           number;   // % vs mismo período año anterior
  // Clientes
  clientes:       number;
  pctTotalCli:    number;
  vsMesAntCli:    number;
  vsAACli:        number;
  // Ticket promedio
  ticketProm:     number;
  vsAATicket:     number;
  // Productos / Chango
  productos:      number;
  changoProm:     number;
  vsMesAntChango: number;
  // Superficie
  mts:            number | null;  // metros cuadrados aproximados (null = sin datos)
  factPorMt:      number | null;  // facturación acumulada / mts
  // Estado
  estado:         "green" | "yellow" | "red";
};

// MTD acumulados reales días 2–14 de mayo 2026
// Colón:     $795.135.950 | 20.234 clientes | 236.039 productos
// Serrano:   $594.728.256 | 14.878 clientes
// Perón:     $447.840.865 | 14.817 clientes
// San Martín:$561.457.916 | 21.040 clientes
// Virtual:   $336.059.773 |  4.317 clientes
export const branchRows: BranchRow[] = [
  {
    name: "Colón",
    facturacion: 795_135_950, pctTotal: 29.07, vsMesAnt:  8.15, vsAA:  9.85,
    clientes: 20_234, pctTotalCli: 26.87, vsMesAntCli: -1.68, vsAACli:  9.45,
    ticketProm: 39_298, vsAATicket:  0.37,
    productos: 236_039, changoProm: 11.67, vsMesAntChango: -2.54,
    mts: 950, factPorMt: Math.round(795_135_950 / 950),
    estado: "green",
  },
  {
    name: "Serrano",
    facturacion: 594_728_256, pctTotal: 21.75, vsMesAnt:  3.42, vsAA: 10.21,
    clientes: 14_878, pctTotalCli: 19.76, vsMesAntCli:  6.14, vsAACli: 12.58,
    ticketProm: 39_972, vsAATicket: -1.23,
    productos: 161_863, changoProm: 10.88, vsMesAntChango: -0.43,
    mts: 685, factPorMt: Math.round(594_728_256 / 685),
    estado: "green",
  },
  {
    name: "Perón",
    facturacion: 447_840_865, pctTotal: 16.37, vsMesAnt:  1.06, vsAA: 12.43,
    clientes: 14_817, pctTotalCli: 19.68, vsMesAntCli: -0.08, vsAACli: 13.89,
    ticketProm: 30_224, vsAATicket: -1.28,
    productos: 138_668, changoProm:  9.36, vsMesAntChango: -2.18,
    mts: 600, factPorMt: Math.round(447_840_865 / 600),
    estado: "yellow",
  },
  {
    name: "San Martín",
    facturacion: 561_457_916, pctTotal: 20.53, vsMesAnt:  2.17, vsAA:  8.65,
    clientes: 21_040, pctTotalCli: 27.95, vsMesAntCli:  2.12, vsAACli:  6.30,
    ticketProm: 26_686, vsAATicket:  2.21,
    productos: 185_085, changoProm:  8.80, vsMesAntChango: -0.98,
    mts: 710, factPorMt: Math.round(561_457_916 / 710),
    estado: "yellow",
  },
  {
    name: "Virtual",
    facturacion: 336_059_773, pctTotal: 12.28, vsMesAnt: -5.16, vsAA: 16.42,
    clientes:  4_317, pctTotalCli:  5.73, vsMesAntCli: -4.81, vsAACli: 14.75,
    ticketProm: 77_848, vsAATicket:  1.45,
    productos:  81_103, changoProm: 18.79, vsMesAntChango: -5.06,
    mts: null, factPorMt: null,
    estado: "yellow",
  },
];

export const totalRow: BranchRow = {
  name: "TOTAL CADENA",
  facturacion: 2_735_222_760, pctTotal: 100, vsMesAnt: 8.65, vsAA: 11.34,
  clientes: 75_286, pctTotalCli: 100, vsMesAntCli: -3.57, vsAACli: 5.23,
  ticketProm: 36_330, vsAATicket: 5.80,
  productos: 802_758, changoProm: 10.66, vsMesAntChango: -1.20,
  mts: 2_945, factPorMt: Math.round((795_135_950 + 594_728_256 + 447_840_865 + 561_457_916) / 2_945),
  estado: "yellow",
};

// ── Objetivos mensuales (gauge) — acumulados MTD días 2-14 ──
export const monthlyGoals = {
  facturacion: {
    acumulado:  2_735_222_760,  // MTD real días 2–14
    objetivo:   6_500_000_000,  // objetivo mensual completo (31 días)
  },
  clientes: {
    acumulado:  75_286,         // MTD real días 2–14
    objetivo:  175_000,         // objetivo mensual completo
  },
  changoPromedio: {
    acumulado:  10.66,          // productos/clientes MTD
    objetivo:   10.86,
  },
};

// ── Alertas críticas ────────────────────────────────────────
export const alerts = [
  { severity: "green",  text: "Facturación MTD +11,34% vs. igual período 2025. Cadena por encima del año anterior." },
  { severity: "yellow", text: "Virtual: facturación MTD -5,16% vs mes anterior. Requiere seguimiento." },
  { severity: "yellow", text: "Ticket promedio cadena -7,90% vs día anterior. Canal Perón y San Martín por revisar." },
  { severity: "yellow", text: "Serrano: clientes +6,14% vs mes anterior pero ticket -1,23% vs AA." },
];

// ── Mix de medios de pago ────────────────────────────────────
export const paymentMix = [
  { name: "Efectivo",        value: 30, color: "#1d4ed8" },
  { name: "Débito",          value: 35, color: "#0891b2" },
  { name: "Crédito",         value: 20, color: "#0f766e" },
  { name: "Billeteras Dig.", value: 14, color: "#ca8a04" },
  { name: "Otros",           value:  1, color: "#6b7280" },
];

export const paymentByBranch = [
  { branch: "Colón",      efectivo: 28, debito: 37, credito: 21, billeteras: 13, otros: 1 },
  { branch: "Serrano",    efectivo: 35, debito: 32, credito: 18, billeteras: 14, otros: 1 },
  { branch: "San Martín", efectivo: 30, debito: 36, credito: 20, billeteras: 13, otros: 1 },
  { branch: "Perón",      efectivo: 27, debito: 35, credito: 22, billeteras: 15, otros: 1 },
  { branch: "Virtual",    efectivo: 32, debito: 34, credito: 19, billeteras: 14, otros: 1 },
];

// ── Control de merma ─────────────────────────────────────────
export const shrinkage = {
  conocida:    { monto: 87_400,  pct: 0.76 },
  desconocida: { monto: 182_300, pct: 1.59 },
};

// ── RRHH / Dotación ──────────────────────────────────────────
export type RRHHRow = {
  branch:       string;
  programados:  number;
  presentes:    number;
  ausentismo:   number;
  estado:       "green" | "yellow" | "red";
};
export const rrhhData: RRHHRow[] = [
  { branch: "Colón",      programados: 42, presentes: 40, ausentismo:  4.8, estado: "green"  },
  { branch: "Serrano",    programados: 31, presentes: 26, ausentismo: 16.1, estado: "red"    },
  { branch: "San Martín", programados: 38, presentes: 32, ausentismo: 15.8, estado: "red"    },
  { branch: "Perón",      programados: 35, presentes: 32, ausentismo:  8.6, estado: "green"  },
  { branch: "Virtual",    programados: 28, presentes: 25, ausentismo: 10.7, estado: "yellow" },
];

// ── Tendencia 35 días (últimos 35 días acumulados) ───────────
// Seeded pseudo-random so SSR & client produce identical values (no hydration mismatch)
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10_000;
  return x - Math.floor(x); // 0..1
}

function generateTrendDays() {
  const days = [];
  // Fixed dates — no runtime Date.now() calls
  const baseYear  = 2026;
  const baseMonth = 4; // May (0-indexed)
  const baseDay   = 15;

  for (let i = 34; i >= 0; i--) {
    const d = new Date(baseYear, baseMonth, baseDay - i);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const label = `${dd}/${mm}`;

    const r1 = seededRand(i * 3);
    const r2 = seededRand(i * 3 + 1);
    const r3 = seededRand(i * 3 + 2);
    const r4 = seededRand(i * 3 + 3);

    const base      = 350_000_000 + Math.sin(i * 0.35) * 28_000_000 + (r1 - 0.5) * 18_000_000;
    const baseAA    = base * (0.97 + r2 * 0.04);
    const clients   = Math.round(66_000 + Math.sin(i * 0.35) * 5_000 + (r3 - 0.5) * 3_000);
    const clientsAA = Math.round(clients * (0.95 + r4 * 0.04));

    days.push({
      date:          label,
      facturacion:   Math.round(base),
      facturacionAA: Math.round(baseAA),
      metaDiaria:    376_538_176,
      clientes:      clients,
      clientesAA:    clientsAA,
      ticketProm:    Math.round(base / clients),
      ticketPromAA:  Math.round(baseAA / clientsAA),
    });
  }
  return days;
}
export const trendData = generateTrendDays();
