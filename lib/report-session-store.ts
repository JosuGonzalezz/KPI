// ============================================================
// REPORT SESSION STORE
// Almacena datos ingresados manualmente en sessionStorage.
// Se limpian automáticamente al cerrar la pestaña.
// No requiere Supabase ni backend.
// ============================================================

// ── Types ─────────────────────────────────────────────────────

export type BranchBreakdown = {
  total:     number;
  colon:     number;
  serrano:   number;
  peron:     number;
  sanMartin: number;
  virtual:   number;
};

export type PeriodSnapshot = {
  facturacion: BranchBreakdown;
  clientes:    BranchBreakdown;
  producto:    BranchBreakdown;
};

export type RRHHBranchEntry = {
  programados: number;
  presentes:   number;
};

export type RRHHSnapshot = {
  colon:     RRHHBranchEntry;
  serrano:   RRHHBranchEntry;
  peron:     RRHHBranchEntry;
  sanMartin: RRHHBranchEntry;
  virtual:   RRHHBranchEntry;
};

// ── Default empty values ──────────────────────────────────────

const emptyBreakdown = (): BranchBreakdown => ({
  total: 0, colon: 0, serrano: 0, peron: 0, sanMartin: 0, virtual: 0,
});

export const DEFAULT_PERIOD_SNAPSHOT = (): PeriodSnapshot => ({
  facturacion: emptyBreakdown(),
  clientes:    emptyBreakdown(),
  producto:    emptyBreakdown(),
});

const emptyRRHHEntry = (): RRHHBranchEntry => ({ programados: 0, presentes: 0 });

export const DEFAULT_RRHH_SNAPSHOT = (): RRHHSnapshot => ({
  colon:     emptyRRHHEntry(),
  serrano:   emptyRRHHEntry(),
  peron:     emptyRRHHEntry(),
  sanMartin: emptyRRHHEntry(),
  virtual:   emptyRRHHEntry(),
});

// ── Session storage keys ──────────────────────────────────────

const KEYS = {
  mesAnterior:  "kpi_mes_anterior",
  mismoMesAA:   "kpi_mismo_mes_aa",
  acumuladoMTD: "kpi_acumulado_mtd",
  rrhhAyer:     "kpi_rrhh_ayer",
  hasMTDData:   "kpi_has_mtd_data",
  hasRRHHData:  "kpi_has_rrhh_data",
} as const;

// ── Helpers ───────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function loadFromSession<T>(key: string, fallback: () => T): T {
  if (!isBrowser()) return fallback();
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback();
    return JSON.parse(raw) as T;
  } catch {
    return fallback();
  }
}

function saveToSession<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore quota errors */ }
}

// ── Public API ────────────────────────────────────────────────

export function loadMesAnterior():  PeriodSnapshot { return loadFromSession(KEYS.mesAnterior,  DEFAULT_PERIOD_SNAPSHOT); }
export function loadMismoMesAA():   PeriodSnapshot { return loadFromSession(KEYS.mismoMesAA,   DEFAULT_PERIOD_SNAPSHOT); }
export function loadAcumuladoMTD(): PeriodSnapshot { return loadFromSession(KEYS.acumuladoMTD, DEFAULT_PERIOD_SNAPSHOT); }
export function loadRRHHAyer():     RRHHSnapshot   { return loadFromSession(KEYS.rrhhAyer,     DEFAULT_RRHH_SNAPSHOT); }

export function saveMesAnterior(data: PeriodSnapshot):  void { saveToSession(KEYS.mesAnterior,  data); saveToSession(KEYS.hasMTDData, true); }
export function saveMismoMesAA(data: PeriodSnapshot):   void { saveToSession(KEYS.mismoMesAA,   data); saveToSession(KEYS.hasMTDData, true); }
export function saveAcumuladoMTD(data: PeriodSnapshot): void { saveToSession(KEYS.acumuladoMTD, data); saveToSession(KEYS.hasMTDData, true); }
export function saveRRHHAyer(data: RRHHSnapshot):       void { saveToSession(KEYS.rrhhAyer, data); saveToSession(KEYS.hasRRHHData, true); }

/** ¿Se cargaron datos MTD manualmente en esta sesión? */
export function hasMTDData(): boolean {
  if (!isBrowser()) return false;
  return sessionStorage.getItem(KEYS.hasMTDData) === "true";
}

/** ¿Se cargaron datos RRHH manualmente en esta sesión? */
export function hasRRHHData(): boolean {
  if (!isBrowser()) return false;
  return sessionStorage.getItem(KEYS.hasRRHHData) === "true";
}

/** Limpia todos los datos de reporte de la sesión */
export function clearReportSession(): void {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach(k => sessionStorage.removeItem(k));
}
