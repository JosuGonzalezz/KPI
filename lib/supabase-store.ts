// ============================================================
// SUPABASE STORE — Reemplazo del store local con Supabase
// ============================================================

'use server';

import { supabase, type DailyRecord, type AppConfig } from './supabase';
import type { TipoMetrica, BranchKey } from './report-data';

// ── Helpers de formateo ──────────────────────────────────────
function formatBranchKey(key: string): string {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// ── Config ────────────────────────────────────────────────────

/** Lee la configuración activa del reporte */
export async function getConfig(): Promise<AppConfig> {
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching config:', error);
    // Fallback a valores por defecto si no hay datos
    return {
      id: 1,
      current_year: 2026,
      current_month: 5,
      current_day: 14,
      updated_at: new Date().toISOString(),
    };
  }

  return {
    id: data.id,
    current_year: data.current_year,
    current_month: data.current_month,
    current_day: data.current_day,
    updated_at: data.updated_at,
  };
}

/** Guarda la configuración activa */
export async function saveConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  // Intentar actualizar primero
  const { data: existing, error: fetchError } = await supabase
    .from('config')
    .select('id')
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('config')
      .update({
        ...config,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Si no existe, crear nuevo registro
    const { data, error } = await supabase
      .from('config')
      .insert({
        ...config,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ── Records ───────────────────────────────────────────────────

/** Lee todos los registros del store */
export async function getAllRecords(): Promise<DailyRecord[]> {
  const { data, error } = await supabase
    .from('daily_records')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error fetching records:', error);
    return [];
  }

  return data;
}

/** Devuelve registros filtrados por año y mes */
export async function getRecordsByYearMonth(
  year: number,
  month: number
): Promise<DailyRecord[]> {
  const { data, error } = await supabase
    .from('daily_records')
    .select('*')
    .eq('year', year)
    .eq('month', month)
    .order('day', { ascending: true });

  if (error) {
    console.error('Error fetching records by year/month:', error);
    return [];
  }

  return data;
}

/**
 * Inserta o reemplaza registros. La clave única es (fecha + tipo).
 */
export async function upsertRecords(
  incoming: DailyRecord[]
): Promise<{ inserted: number; updated: number }> {
  const all = await getAllRecords();
  const key = (r: DailyRecord) => `${r.fecha}::${r.tipo}`;
  const map = new Map<string, DailyRecord>(
    all.map((r) => [key(r), r])
  );

  let inserted = 0;
  let updated = 0;

  for (const r of incoming) {
    if (map.has(key(r))) {
      updated++;
    } else {
      inserted++;
    }
    map.set(key(r), r);
  }

  // Convertir a array y upsert
  const recordsToUpsert = Array.from(map.values()).map((r) => ({
    ...r,
    san_martin: r.sanMartin, // Renombrar para Supabase
  }));

  const { error } = await supabase
    .from('daily_records')
    .upsert(recordsToUpsert, {
      onConflict: 'fecha,tipo',
    });

  if (error) {
    console.error('Error upserting records:', error);
    // Fallback: insert individual
    for (const r of recordsToUpsert) {
      await supabase.from('daily_records').upsert(r, {
        onConflict: 'fecha,tipo',
      });
    }
  }

  return { inserted, updated };
}

/** Elimina todos los registros de un año+mes */
export async function deleteByYearMonth(
  year: number,
  month: number
): Promise<number> {
  const { error } = await supabase
    .from('daily_records')
    .delete()
    .eq('year', year)
    .eq('month', month);

  if (error) {
    console.error('Error deleting records:', error);
    return 0;
  }

  return 1;
}

// ── CSV Parser ────────────────────────────────────────────────

/**
 * Parsea el CSV en el formato del reporte:
 * Fecha | Colón | Serrano | Perón | San Martín | Virtual | Total | Tipo
 */
export function parseCSV(raw: string): { records: DailyRecord[]; errors: string[] } {
  const lines  = raw.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const errors: string[] = [];
  const records: DailyRecord[] = [];

  if (lines.length < 2) return { records, errors: ["Archivo vacío o sin datos"] };

  // Detectar separador
  const header = lines[0];
  const sep = header.includes("\t") ? "\t" : header.includes(";") ? ";" : ",";

  // Función para parsear número
  const parseNum = (s: string): number | null => {
    const trimmed = s?.trim() ?? "";
    if (!trimmed || trimmed === "") return null;

    let clean = trimmed;
    const hasDot   = clean.includes(".");
    const hasComma = clean.includes(",");

    if (hasDot && hasComma) {
      clean = clean.replace(/\./g, "").replace(",", ".");
    } else if (hasComma && !hasDot) {
      const parts = clean.split(",");
      if (parts.length === 2 && parts[1].length <= 3) {
        clean = clean.replace(",", ".");
      } else {
        clean = clean.replace(/,/g, "");
      }
    } else if (hasDot && !hasComma) {
      const parts = clean.split(".");
      if (parts.length > 2) {
        clean = clean.replace(/\./g, "");
      }
    }

    const n = parseFloat(clean);
    return isNaN(n) ? null : Math.round(n);
  };

  // Función para parsear fecha
  const parseFecha = (s: string): { day: number; month: number; year: number; fechaNorm: string } | null => {
    const trimmed = s?.trim() ?? "";
    const match = trimmed.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/);
    if (!match) return null;
    const day   = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year  = parseInt(match[3], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const fechaNorm = `${String(day).padStart(2,"0")}/${String(month).padStart(2,"0")}/${year}`;
    return { day, month, year, fechaNorm };
  };

  const TIPOS_VALIDOS: ('Clientes' | 'Producto' | 'Facturacion')[] = ["Clientes", "Producto", "Facturacion"];

  const dataLines = lines.slice(1);

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    let cols: string[];

    if (sep === ",") {
      const rawCols = line.split(",");
      const tipoIndex = rawCols.findIndex(c => TIPOS_VALIDOS.includes(c.trim() as any));

      if (tipoIndex !== -1) {
        const fechaCol = rawCols[0];
        const tipoCol  = rawCols[tipoIndex];
        const numPart  = rawCols.slice(1, tipoIndex).join(",");

        const numTokens = numPart.split(",");
        const numCols: string[] = [];
        let j = 0;
        while (j < numTokens.length) {
          const current = numTokens[j];
          const next    = numTokens[j + 1];
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

    const fechaParsed = parseFecha(rawFecha);
    if (!fechaParsed) {
      errors.push(`Línea ${i + 2}: fecha inválida "${rawFecha}"`);
      continue;
    }
    const { day, month, year, fechaNorm } = fechaParsed;

    const tipoRaw = rawTipo?.trim() ?? "";
    const tipo = (TIPOS_VALIDOS.includes(tipoRaw as any) ? tipoRaw : null) as any;
    if (!tipo) {
      errors.push(`Línea ${i + 2}: tipo desconocido "${tipoRaw}"`);
      continue;
    }

    const record: DailyRecord = {
      id: 0,
      fecha:     fechaNorm,
      year,
      month,
      day,
      colon:     parseNum(rawColon),
      serrano:   parseNum(rawSerrano),
      peron:     parseNum(rawPeron),
      san_martin: parseNum(rawSanMartin),
      virtual:   parseNum(rawVirtual),
      total:     parseNum(rawTotal) ?? 0,
      tipo:      tipo,
      created_at: new Date().toISOString(),
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
export function derivePeriods(
  currentYear: number,
  currentMonth: number
) {
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  return {
    mesActual: { year: currentYear, month: currentMonth },
    mesAnterior: { year: prevYear, month: prevMonth },
    mismoMesAAnt: { year: currentYear - 1, month: currentMonth },
  };
}
