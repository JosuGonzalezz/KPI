import { NextResponse } from "next/server";
import { getConfig, getRecordsByYearMonth, derivePeriods } from "@/lib/store";
import type { DailyRecord, TipoMetrica, BranchKey } from "@/lib/report-data";

function calcMTD(records: DailyRecord[], tipo: TipoMetrica, upToDay: number): number {
  return records
    .filter(r => r.tipo === tipo && r.day <= upToDay)
    .reduce((s, r) => s + r.total, 0);
}

function calcMTDByBranch(records: DailyRecord[], tipo: TipoMetrica, upToDay: number): Record<BranchKey, number> {
  const out: Record<BranchKey, number> = { colon: 0, serrano: 0, peron: 0, sanMartin: 0, virtual: 0 };
  records
    .filter(r => r.tipo === tipo && r.day <= upToDay)
    .forEach(r => {
      (["colon", "serrano", "peron", "sanMartin", "virtual"] as BranchKey[]).forEach(k => {
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
  const config  = getConfig();
  const periods = derivePeriods(config.currentYear, config.currentMonth);
  const upToDay = config.currentDay;

  const recActual   = getRecordsByYearMonth(periods.mesActual.year,    periods.mesActual.month);
  const recAnterior = getRecordsByYearMonth(periods.mesAnterior.year,  periods.mesAnterior.month);
  const recAAnt     = getRecordsByYearMonth(periods.mismoMesAAnt.year, periods.mismoMesAAnt.month);

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
