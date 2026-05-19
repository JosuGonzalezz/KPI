// ============================================================
// SUPABASE SERVER — Funciones async para usar en rutas API
// ============================================================

import { supabase } from './supabase';
import type { DailyRecord, AppConfig } from './supabase';

// ── Config ────────────────────────────────────────────────────

export async function getConfig(): Promise<AppConfig> {
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching config:', error);
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

export async function saveConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  const { data: existing } = await supabase
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

  const recordsToUpsert = Array.from(map.values());

  const { error } = await supabase
    .from('daily_records')
    .upsert(recordsToUpsert, {
      onConflict: 'fecha,tipo',
    });

  if (error) {
    console.error('Error upserting records:', error);
    for (const r of recordsToUpsert) {
      await supabase.from('daily_records').upsert(r, {
        onConflict: 'fecha,tipo',
      });
    }
  }

  return { inserted, updated };
}

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

// ── Cálculos de Objetivos del Mes ────────────────────────────

export type MonthlyTotals = {
  facturacion: number;
  clientes: number;
  producto: number;
  byBranch: {
    colon: { facturacion: number; clientes: number; producto: number };
    serrano: { facturacion: number; clientes: number; producto: number };
    peron: { facturacion: number; clientes: number; producto: number };
    san_martin: { facturacion: number; clientes: number; producto: number };
    virtual: { facturacion: number; clientes: number; producto: number };
  };
};

export async function getMonthlyTotals(
  year: number,
  month: number
): Promise<MonthlyTotals> {
  const records = await getRecordsByYearMonth(year, month);

  const totals: MonthlyTotals = {
    facturacion: 0,
    clientes: 0,
    producto: 0,
    byBranch: {
      colon: { facturacion: 0, clientes: 0, producto: 0 },
      serrano: { facturacion: 0, clientes: 0, producto: 0 },
      peron: { facturacion: 0, clientes: 0, producto: 0 },
      san_martin: { facturacion: 0, clientes: 0, producto: 0 },
      virtual: { facturacion: 0, clientes: 0, producto: 0 },
    },
  };

  records.forEach((record) => {
    const tipo = record.tipo as 'Facturacion' | 'Clientes' | 'Producto';
    const tipoKey = tipo === 'Facturacion' ? 'facturacion' : tipo === 'Clientes' ? 'clientes' : 'producto';

    totals[tipoKey] += record.total;

    const branches = [
      { key: 'colon' as const, value: record.colon },
      { key: 'serrano' as const, value: record.serrano },
      { key: 'peron' as const, value: record.peron },
      { key: 'san_martin' as const, value: record.san_martin },
      { key: 'virtual' as const, value: record.virtual },
    ];

    branches.forEach(({ key, value }) => {
      if (value !== null) {
        totals.byBranch[key][tipoKey] += value;
      }
    });
  });

  return totals;
}

export function derivePeriods(currentYear: number, currentMonth: number) {
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  return {
    mesActual: { year: currentYear, month: currentMonth },
    mesAnterior: { year: prevYear, month: prevMonth },
    mismoMesAAnt: { year: currentYear - 1, month: currentMonth },
  };
}

export async function calculateMonthlyGoals(
  currentYear: number,
  currentMonth: number,
  currentDay: number,
  daysInCurrentMonth: number
) {
  const percentageTranscurred = (currentDay / daysInCurrentMonth) * 100;
  const periods = derivePeriods(currentYear, currentMonth);

  const [prevMonthTotals, sameMonthLastYearTotals] = await Promise.all([
    getMonthlyTotals(periods.mesAnterior.year, periods.mesAnterior.month),
    getMonthlyTotals(periods.mismoMesAAnt.year, periods.mismoMesAAnt.month),
  ]);

  const applyPercentage = (totals: MonthlyTotals, percentage: number): MonthlyTotals => {
    const factor = percentage / 100;
    return {
      facturacion: Math.round(totals.facturacion * factor),
      clientes: Math.round(totals.clientes * factor),
      producto: Math.round(totals.producto * factor),
      byBranch: {
        colon: {
          facturacion: Math.round(totals.byBranch.colon.facturacion * factor),
          clientes: Math.round(totals.byBranch.colon.clientes * factor),
          producto: Math.round(totals.byBranch.colon.producto * factor),
        },
        serrano: {
          facturacion: Math.round(totals.byBranch.serrano.facturacion * factor),
          clientes: Math.round(totals.byBranch.serrano.clientes * factor),
          producto: Math.round(totals.byBranch.serrano.producto * factor),
        },
        peron: {
          facturacion: Math.round(totals.byBranch.peron.facturacion * factor),
          clientes: Math.round(totals.byBranch.peron.clientes * factor),
          producto: Math.round(totals.byBranch.peron.producto * factor),
        },
        san_martin: {
          facturacion: Math.round(totals.byBranch.san_martin.facturacion * factor),
          clientes: Math.round(totals.byBranch.san_martin.clientes * factor),
          producto: Math.round(totals.byBranch.san_martin.producto * factor),
        },
        virtual: {
          facturacion: Math.round(totals.byBranch.virtual.facturacion * factor),
          clientes: Math.round(totals.byBranch.virtual.clientes * factor),
          producto: Math.round(totals.byBranch.virtual.producto * factor),
        },
      },
    };
  };

  return {
    percentageTranscurred,
    prevMonthGoals: applyPercentage(prevMonthTotals, percentageTranscurred),
    sameMonthLastYearGoals: applyPercentage(sameMonthLastYearTotals, percentageTranscurred),
  };
}


// ── CSV Parser ────────────────────────────────────────────────

/**
 * Parsea el CSV en el formato del reporte:
 * Fecha | Colón | Serrano | Perón | San Martín | Virtual | Total | Tipo
 */
export async function parseCSV(raw: string): Promise<{ records: DailyRecord[]; errors: string[] }> {
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
