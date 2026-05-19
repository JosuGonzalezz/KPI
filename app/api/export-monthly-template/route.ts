import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/export-monthly-template?year=2025&month=4&monthName=Abril
 * Genera un CSV de plantilla para totales mensuales
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const monthName = searchParams.get("monthName");

    if (!year || !month || !monthName) {
      return NextResponse.json(
        { error: "year, month y monthName requeridos" },
        { status: 400 }
      );
    }

    // Generar CSV con estructura esperada
    const lines: string[] = [];

    // Header
    lines.push("Fecha\tColón\tSerrano\tPerón\tSan Martín\tVirtual\tTotal\tTipo");

    // Filas de ejemplo
    lines.push(`${monthName}\t57761896\t43244684\t33078680\t44123726\t23994968\t202203955\tFacturacion`);
    lines.push(`${monthName}\t57220008\t40843916\t28780919\t41964017\t29772365\t198581228\tClientes`);
    lines.push(`${monthName}\t57976725\t41306079\t32673624\t42260289\t29969158\t204185878\tProductos`);

    // Crear CSV
    const csv = lines.join("\n");

    // Retornar como descarga
    const filename = `Totales_${monthName}_${year}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating monthly template:", error);
    return NextResponse.json(
      { error: "Error generating template" },
      { status: 500 }
    );
  }
}
