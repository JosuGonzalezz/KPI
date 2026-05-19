// ============================================================
// DATA STORE — Persistencia local en archivo JSON
// Preparado para swap a Supabase: cada función tiene el
// comentario "// TODO: replace with supabase query"
// ============================================================

import fs from "fs";
import path from "path";
import type { DailyRecord, TipoMetrica } from "./report-data";

const DATA_DIR  = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "records.json");
const CONF_FILE = path.join(DATA_DIR, "config.json");

// ── Tipos ─────────────────────────────────────────────────────

export type AppConfig = {
  /** año del mes en curso */
  currentYear:  number;
  /** mes en curso (1-12) */
  currentMonth: number;
  /** último día cargado del mes en curso */
  currentDay:   number;
  /** cuándo se actualizó por última vez */
  updatedAt:    string;
};

// ── Helpers de archivo ────────────────────────────────────────

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(filePath: string, data: unknown) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Config ────────────────────────────────────────────────────

const DEFAULT_CONFIG: AppConfig = {
  currentYear:  2026,
  currentMonth: 5,
  currentDay:   14,
  updatedAt:    new Date().toISOString(),
};

/** Lee la configuración activa del reporte */
// TODO: replace with → supabase.from('config').select('*').single()
export function getConfig(): AppConfig {
  return readJSON<AppConfig>(CONF_FILE, DEFAULT_CONFIG);
}

/** Guarda la configuración activa */
// TODO: replace with → supabase.from('config').upsert(config)
export function saveConfig(config: Partial<AppConfig>): AppConfig {
  const current = getConfig();
  const next: AppConfig = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString(),
  };
  writeJSON(CONF_FILE, next);
  return next;
}

// ── Records ───────────────────────────────────────────────────

/** Lee todos los registros del store */
// TODO: replace with → supabase.from('daily_records').select('*')
export function getAllRecords(): DailyRecord[] {
  return readJSON<DailyRecord[]>(DATA_FILE, []);
}

/** Devuelve registros filtrados por año y mes */
// TODO: replace with → supabase.from('daily_records').select('*').eq('year', y).eq('month', m)
export function getRecordsByYearMonth(year: number, month: number): DailyRecord[] {
  const all = getAllRecords();
  return all.filter(r => r.year === year && r.month === month);
}

/**
 * Inserta o reemplaza registros. La clave única es (fecha + tipo).
 * Los registros nuevos se agregan y los existentes se actualizan.
 */
// TODO: replace with → supabase.from('daily_records').upsert(records, { onConflict: 'fecha,tipo' })
export function upsertRecords(incoming: DailyRecord[]): { inserted: number; updated: number } {
  const all = getAllRecords();
  const key = (r: DailyRecord) => `${r.fecha}::${r.tipo}`;
  const map = new Map<string, DailyRecord>(all.map(r => [key(r), r]));

  let inserted = 0;
  let updated  = 0;

  for (const r of incoming) {
    if (map.has(key(r))) {
      updated++;
    } else {
      inserted++;
    }
    map.set(key(r), r);
  }

  writeJSON(DATA_FILE, Array.from(map.values()));
  return { inserted, updated };
}

/** Elimina todos los registros de un año+mes */
// TODO: replace with → supabase.from('daily_records').delete().eq('year', y).eq('month', m)
export function deleteByYearMonth(year: number, month: number): number {
  const all = getAllRecords();
  const kept    = all.filter(r => !(r.year === year && r.month === month));
  const deleted = all.length - kept.length;
  writeJSON(DATA_FILE, kept);
  return deleted;
}

// ── CSV Parser ────────────────────────────────────────────────

/**
 * Parsea el CSV en el formato del reporte:
 * Fecha | Colón | Serrano | Perón | San Martín | Virtual | Total | Tipo
 *
 * Tolerancias implementadas:
 * - Separador auto-detectado: tab / punto y coma / coma
 * - Fecha: D/M/YYYY, DD/MM/YYYY, D.M.YYYY, DD.MM.YYYY, DD-MM-YYYY
 * - Números con DOS formatos mixtos en el mismo archivo:
 *     • Coma decimal:       57761896,19  →  57761896
 *     • Punto de miles:     54.585.034   →  54585034
 *     • Punto decimal:      57761896.19  →  57761896
 * - Cuando el separador es coma y los números también tienen coma decimal,
 *   el parser reconstruye los campos usando la columna de Tipo como ancla.
 */
export function parseCSV(raw: string): { records: DailyRecord[]; errors: string[] } {
  // Eliminar BOM UTF-8 si está presente
  const lines  = raw.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const errors: string[] = [];
  const records: DailyRecord[] = [];

  if (lines.length < 2) return { records, errors: ["Archivo vacío o sin datos"] };

  // ── Detectar separador: tab > punto y coma > coma ─────────
  const header = lines[0];
  const sep = header.includes("\t") ? "\t" : header.includes(";") ? ";" : ",";

  // ── Función para parsear número con formato español / mixto ──
  // Casos:
  //   "57761896,19"  → tiene coma decimal, no hay punto → comma es decimal
  //   "54.585.034"   → tiene punto pero no coma → puntos son miles
  //   "57.761.896,2" → punto de miles + coma decimal
  //   "57761896.19"  → punto decimal (sin coma)
  //   ""             → null (celda vacía)
  const parseNum = (s: string): number | null => {
    const trimmed = s?.trim() ?? "";
    if (!trimmed || trimmed === "") return null;

    let clean = trimmed;
    const hasDot   = clean.includes(".");
    const hasComma = clean.includes(",");

    if (hasDot && hasComma) {
      // Formato europeo: 57.761.896,2  → quitar puntos, cambiar coma por punto
      clean = clean.replace(/\./g, "").replace(",", ".");
    } else if (hasComma && !hasDot) {
      // Solo coma: puede ser decimal (57761896,19) o miles (57,761,896)
      const parts = clean.split(",");
      if (parts.length === 2 && parts[1].length <= 3) {
        // Probablemente coma decimal: "57761896,19"
        clean = clean.replace(",", ".");
      } else {
        // Coma de miles: eliminar
        clean = clean.replace(/,/g, "");
      }
    } else if (hasDot && !hasComma) {
      const parts = clean.split(".");
      if (parts.length > 2) {
        // Múltiples puntos → separador de miles: "54.585.034"
        clean = clean.replace(/\./g, "");
      }
      // Si hay un solo punto → decimal normal, dejar como está
    }

    const n = parseFloat(clean);
    return isNaN(n) ? null : Math.round(n);
  };

  // ── Función para parsear fecha en múltiples formatos ─────
  // Acepta: D/M/YYYY, DD/MM/YYYY, D.M.YYYY, DD.MM.YYYY, DD-MM-YYYY
  const parseFecha = (s: string): { day: number; month: number; year: number; fechaNorm: string } | null => {
    const trimmed = s?.trim() ?? "";
    const match = trimmed.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/);
    if (!match) return null;
    const day   = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year  = parseInt(match[3], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    // Normalizar a DD/MM/YYYY
    const fechaNorm = `${String(day).padStart(2,"0")}/${String(month).padStart(2,"0")}/${year}`;
    return { day, month, year, fechaNorm };
  };

  // ── Tipos válidos ─────────────────────────────────────────
  const TIPOS_VALIDOS: TipoMetrica[] = ["Clientes", "Producto", "Facturacion"];

  // ── Parsear líneas ────────────────────────────────────────
  const dataLines = lines.slice(1);

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    // Cuando el separador es coma y hay números con coma decimal, una línea como:
    //   14/5/2026,57761896,19,43244684,36,...,Facturacion
    // genera más de 8 columnas. Para manejar esto, usamos el Tipo como ancla:
    // el Tipo siempre es la última columna y es un string sin comas.
    let cols: string[];

    if (sep === ",") {
      // Dividir por coma y reconstruir agrupando columnas numéricas
      const rawCols = line.split(",");
      const tipoIndex = rawCols.findIndex(c => TIPOS_VALIDOS.includes(c.trim() as TipoMetrica));

      if (tipoIndex !== -1) {
        // El tipo está en rawCols[tipoIndex]
        // Columna 0 = fecha, columnas 1..(tipoIndex-1) = 6 valores numéricos, última = tipo
        const fechaCol = rawCols[0];
        const tipoCol  = rawCols[tipoIndex];
        const numPart  = rawCols.slice(1, tipoIndex).join(",");

        // Los 6 números están separados por coma, pero cada uno puede tener coma decimal.
        // Estrategia: split por "," y reagrupar pares donde el segundo tiene ≤2 dígitos
        const numTokens = numPart.split(",");
        const numCols: string[] = [];
        let j = 0;
        while (j < numTokens.length) {
          const current = numTokens[j];
          const next    = numTokens[j + 1];
          // Si el próximo token tiene ≤ 3 dígitos (parte decimal), fusionar
          if (next !== undefined && /^\d{1,3}$/.test(next.trim())) {
            numCols.push(`${current},${next}`);
            j += 2;
          } else {
            numCols.push(current);
            j += 1;
          }
        }

        cols = [fechaCol, ...numCols, tipoCol];
      } else {
        // Fallback: split directo (CSV sin decimales con coma)
        cols = rawCols;
      }
    } else {
      cols = line.split(sep);
    }

    if (cols.length < 8) {
      errors.push(`Línea ${i + 2}: columnas insuficientes (${cols.length})`);
      continue;
    }

    const [rawFecha, rawColon, rawSerrano, rawPeron, rawSanMartin, rawVirtual, rawTotal, rawTipo] = cols;

    // Parsear fecha
    const fechaParsed = parseFecha(rawFecha);
    if (!fechaParsed) {
      errors.push(`Línea ${i + 2}: fecha inválida "${rawFecha}"`);
      continue;
    }
    const { day, month, year, fechaNorm } = fechaParsed;

    // Normalizar tipo
    const tipoRaw = rawTipo?.trim() ?? "";
    const tipo = (TIPOS_VALIDOS.includes(tipoRaw as TipoMetrica)
      ? tipoRaw
      : null) as TipoMetrica | null;
    if (!tipo) {
      errors.push(`Línea ${i + 2}: tipo desconocido "${tipoRaw}"`);
      continue;
    }

    const record: DailyRecord = {
      fecha:     fechaNorm,
      year,
      month,
      day,
      colon:     parseNum(rawColon),
      serrano:   parseNum(rawSerrano),
      peron:     parseNum(rawPeron),
      sanMartin: parseNum(rawSanMartin),
      virtual:   parseNum(rawVirtual),
      total:     parseNum(rawTotal) ?? 0,
      tipo,
    };

    records.push(record);
  }

  return { records, errors };
}

// ── Derivación automática de períodos ────────────────────────

/**
 * Dado el mes en curso devuelve:
 * - mesActual:    { year, month }
 * - mesAnterior:  { year, month }  (mes anterior)
 * - mismoMesAAnt: { year, month }  (mismo mes año anterior)
 */
export function derivePeriods(currentYear: number, currentMonth: number) {
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear  = currentMonth === 1 ? currentYear - 1 : currentYear;

  return {
    mesActual:    { year: currentYear,  month: currentMonth },
    mesAnterior:  { year: prevYear,     month: prevMonth    },
    mismoMesAAnt: { year: currentYear - 1, month: currentMonth },
  };
}
