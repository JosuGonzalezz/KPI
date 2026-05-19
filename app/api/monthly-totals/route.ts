import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

type MonthlyTotal = {
  year: number;
  month: number;
  month_name: string;
  colon: number;
  serrano: number;
  peron: number;
  san_martin: number;
  virtual: number;
  total: number;
  tipo: 'Clientes' | 'Productos' | 'Facturacion';
};

/**
 * GET /api/monthly-totals?year=2025&month=4
 * Obtiene los totales mensuales para un mes específico
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!year || !month) {
      return NextResponse.json(
        { error: "year y month requeridos" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("monthly_totals")
      .select("*")
      .eq("year", Number(year))
      .eq("month", Number(month));

    if (error) {
      console.error("Error fetching monthly totals:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ totals: data || [] });
  } catch (error) {
    console.error("Error in GET /api/monthly-totals:", error);
    return NextResponse.json(
      { error: "Error fetching monthly totals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monthly-totals
 * Carga totales mensuales desde CSV
 * Formato: Fecha | Colón | Serrano | Perón | San Martín | Virtual | Total | Tipo
 * Donde Fecha es el nombre del mes (ej: "Abril")
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      csvText?: string;
      year: number;
      month: number;
    };

    if (!body.csvText || !body.year || !body.month) {
      return NextResponse.json(
        { error: "csvText, year y month requeridos" },
        { status: 400 }
      );
    }

    // Parsear CSV
    const lines = body.csvText.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
    if (lines.length < 2) {
      return NextResponse.json(
        { error: "Archivo vacío o sin datos" },
        { status: 400 }
      );
    }

    // Detectar separador
    const header = lines[0];
    const sep = header.includes("\t") ? "\t" : header.includes(";") ? ";" : ",";

    const records: MonthlyTotal[] = [];
    const errors: string[] = [];

    // Parsear número
    const parseNum = (s: string): number => {
      const trimmed = s?.trim() ?? "";
      if (!trimmed) return 0;
      
      let clean = trimmed;
      const hasDot = clean.includes(".");
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
      } else if (hasDot && !hasComma && clean.split(".").length > 2) {
        clean = clean.replace(/\./g, "");
      }

      const n = parseFloat(clean);
      return isNaN(n) ? 0 : Math.round(n);
    };

    // Procesar líneas
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(sep);
      if (cols.length < 8) {
        errors.push(`Línea ${i + 1}: columnas insuficientes (${cols.length})`);
        continue;
      }

      const [monthName, rawColon, rawSerrano, rawPeron, rawSanMartin, rawVirtual, rawTotal, rawTipo] = cols;

      const tipo = rawTipo?.trim() as 'Clientes' | 'Productos' | 'Facturacion';
      if (!['Clientes', 'Productos', 'Facturacion'].includes(tipo)) {
        errors.push(`Línea ${i + 1}: tipo inválido "${rawTipo}"`);
        continue;
      }

      records.push({
        year: body.year,
        month: body.month,
        month_name: monthName.trim(),
        colon: parseNum(rawColon),
        serrano: parseNum(rawSerrano),
        peron: parseNum(rawPeron),
        san_martin: parseNum(rawSanMartin),
        virtual: parseNum(rawVirtual),
        total: parseNum(rawTotal),
        tipo,
      });
    }

    if (records.length === 0) {
      return NextResponse.json(
        { ok: false, errors: errors.length > 0 ? errors : ["No se encontraron registros válidos"] },
        { status: 400 }
      );
    }

    // Insertar en Supabase
    const { error } = await supabase
      .from("monthly_totals")
      .upsert(records, {
        onConflict: "year,month,tipo",
      });

    if (error) {
      console.error("Error inserting monthly totals:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      inserted: records.length,
      errors,
    });
  } catch (error) {
    console.error("Error in POST /api/monthly-totals:", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/monthly-totals?year=2025&month=4
 * Elimina los totales mensuales de un mes específico
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!year || !month) {
      return NextResponse.json(
        { error: "year y month requeridos" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("monthly_totals")
      .delete()
      .eq("year", Number(year))
      .eq("month", Number(month));

    if (error) {
      console.error("Error deleting monthly totals:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in DELETE /api/monthly-totals:", error);
    return NextResponse.json(
      { error: "Error deleting monthly totals" },
      { status: 500 }
    );
  }
}
