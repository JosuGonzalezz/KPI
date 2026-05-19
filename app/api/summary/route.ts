import { NextResponse } from "next/server";
import { getConfig, getRecordsByYearMonth, derivePeriods } from "@/lib/supabase-store";
import type { DailyRecord } from "@/lib/supabase";

type TipoMetrica = 'Clientes' | 'Producto' | 'Facturacion';
type BranchKey = 'colon' | 'serrano' | 'peron' | 'san_martin' | 'virtual';

function calcMTD(records: DailyRecord[], tipo: TipoMetrica, upToDay: number): number {
  return records
    .filter(r => r.tipo === tipo && r.day <= upToDay)
    .reduce((s, r) => s + r.total, 0);
}

function calcMTDByBranch(records: DailyRecord[], tipo: TipoMetrica, upToDay: number): Record<BranchKey, number> {
  const out: Record<BranchKey, number> = { colon: 0, serrano: 0, peron: 0, san_martin: 0, virtual: 0 };
  records
    .filter(r => r.tipo === tipo && r.day <= upToDay)
    .forEach(r => {
      (["colon", "serrano", "peron", "san_martin", "virtual"] as BranchKey[]).forEach(k => {
        if (r[k] !== null) out[k] += r[k] as number;
      });
    });
  return out;
}

function calcDailySeries(records: DailyRecord[], tipo: TipoMetrica, upToDay: number) {
  const result: { day: number; value: number; fecha: string }[] = [];
  for (let d = 1; d <= upToDay; d++) {
    const dayRecords = records.filter(r => r.tipo === tipo && r.day === d);
    if (dayRecords.length > 0) {
      result.push({ day: d, value: dayRecords.reduce((s, r) => s + r.total, 0), fecha: dayRecords[0].fecha });
    }
  }
  return result;
}

/**
 * GET /api/summary
 * Devuelve el resumen MTD del mes actual, mes anterior y mismo mes año anterior
 * listo para consumir en el dashboard.
 */
export async function GET() {
  const config  = await getConfig();
  const periods = derivePeriods(config.current_year, config.current_month);
  const upToDay = config.current_day;

  const recActual   = await getRecordsByYearMonth(periods.mesActual.year,    periods.mesActual.month);
  const recAnterior = await getRecordsByYearMonth(periods.mesAnterior.year,  periods.mesAnterior.month);
  const recAAnt     = await getRecordsByYearMonth(periods.mismoMesAAnt.year, periods.mismoMesAAnt.month);

  const hasActual   = recActual.length   > 0;
  const hasAnterior = recAnterior.length > 0;
  const hasAAnt     = recAAnt.length     > 0;

  return NextResponse.json({
    config,
    periods,
    hasData: { actual: hasActual, anterior: hasAnterior, aAnterior: hasAAnt },

    mesActual: hasActual ? {
      facturacion: calcMTD(recActual, "Facturacion", upToDay),
      clientes:    calcMTD(recActual, "Clientes",    upToDay),
      producto:    calcMTD(recActual, "Producto",    upToDay),
      byBranch: {
        facturacion: calcMTDByBranch(recActual, "Facturacion", upToDay),
        clientes:    calcMTDByBranch(recActual, "Clientes",    upToDay),
        producto:    calcMTDByBranch(recActual, "Producto",    upToDay),
      },
      dailySeries: {
        facturacion: calcDailySeries(recActual, "Facturacion", upToDay),
        clientes:    calcDailySeries(recActual, "Clientes",    upToDay),
        producto:    calcDailySeries(recActual, "Producto",    upToDay),
      },
    } : null,

    mesAnterior: hasAnterior ? {
      facturacion: calcMTD(recAnterior, "Facturacion", upToDay),
      clientes:    calcMTD(recAnterior, "Clientes",    upToDay),
      producto:    calcMTD(recAnterior, "Producto",    upToDay),
      byBranch: {
        facturacion: calcMTDByBranch(recAnterior, "Facturacion", upToDay),
      },
    } : null,

    mismoMesAAnt: hasAAnt ? {
      facturacion: calcMTD(recAAnt, "Facturacion", upToDay),
      clientes:    calcMTD(recAAnt, "Clientes",    upToDay),
      producto:    calcMTD(recAAnt, "Producto",    upToDay),
      byBranch: {
        facturacion: calcMTDByBranch(recAAnt, "Facturacion", upToDay),
        clientes:    calcMTDByBranch(recAAnt, "Clientes",    upToDay),
        producto:    calcMTDByBranch(recAAnt, "Producto",    upToDay),
      },
      dailySeries: {
        facturacion: calcDailySeries(recAAnt, "Facturacion", upToDay),
        clientes:    calcDailySeries(recAAnt, "Clientes",    upToDay),
        producto:    calcDailySeries(recAAnt, "Producto",    upToDay),
      },
    } : null,
  });
}
