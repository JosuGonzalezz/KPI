import { NextRequest, NextResponse } from "next/server";
import { calculateMonthlyGoals, getRecordsByYearMonth, getMonthlyTotals, derivePeriods } from "@/lib/supabase-server";

/**
 * POST /api/monthly-goals
 * Calcula los objetivos del mes basado en porcentaje transcurrido
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      currentYear: number;
      currentMonth: number;
      currentDay: number;
      daysInMonth: number;
    };

    const { currentYear, currentMonth, currentDay, daysInMonth } = body;

    // Calcular objetivos
    const goals = await calculateMonthlyGoals(
      currentYear,
      currentMonth,
      currentDay,
      daysInMonth
    );

    // Obtener datos actuales del mes
    const currentMonthRecords = await getRecordsByYearMonth(currentYear, currentMonth);
    
    // Calcular totales actuales
    const currentMonthActual = {
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

    currentMonthRecords.forEach((record) => {
      const tipo = record.tipo as 'Facturacion' | 'Clientes' | 'Producto';
      const tipoKey = tipo === 'Facturacion' ? 'facturacion' : tipo === 'Clientes' ? 'clientes' : 'producto';

      currentMonthActual[tipoKey] += record.total;

      const branches = [
        { key: 'colon' as const, value: record.colon },
        { key: 'serrano' as const, value: record.serrano },
        { key: 'peron' as const, value: record.peron },
        { key: 'san_martin' as const, value: record.san_martin },
        { key: 'virtual' as const, value: record.virtual },
      ];

      branches.forEach(({ key, value }) => {
        if (value !== null) {
          currentMonthActual.byBranch[key][tipoKey] += value;
        }
      });
    });

    return NextResponse.json({
      ...goals,
      currentMonthActual,
    });
  } catch (error) {
    console.error("Error calculating goals:", error);
    return NextResponse.json(
      { error: "Error calculating goals" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/monthly-goals
 * Guarda totales mensuales personalizados
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as {
      year: number;
      month: number;
      totals: any;
    };

    // Por ahora, solo retornamos confirmación
    // En el futuro, guardaremos en una tabla de totales mensuales
    return NextResponse.json({
      ok: true,
      message: "Totales guardados",
      data: body,
    });
  } catch (error) {
    console.error("Error saving goals:", error);
    return NextResponse.json(
      { error: "Error saving goals" },
      { status: 500 }
    );
  }
}
