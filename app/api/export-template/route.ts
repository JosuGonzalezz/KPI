import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/export-template?year=2026&month=4
 * Genera un CSV de ejemplo con la estructura esperada para un mes específico
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

    const yearNum = Number(year);
    const monthNum = Number(month);

    // Validar rango
    if (monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: "month debe estar entre 1 y 12" },
        { status: 400 }
      );
    }

    // Obtener días en el mes
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

    // Generar CSV con estructura esperada
    const lines: string[] = [];

    // Header
    lines.push(
      "Fecha\tColón\tSerrano\tPerón\tSan Martín\tVirtual\tTotal\tTipo"
    );

    // Generar filas de ejemplo para cada día del mes
    const branches = ["Colón", "Serrano", "Perón", "San Martín", "Virtual"];
    const tipos = ["Facturacion", "Clientes", "Producto"];

    for (let day = 1; day <= daysInMonth; day++) {
      const fecha = `${String(day).padStart(2, "0")}.${String(monthNum).padStart(
        2,
        "0"
      )}.${yearNum}`;

      for (const tipo of tipos) {
        // Generar valores de ejemplo realistas
        let colon, serrano, peron, sanMartin, virtual, total;

        if (tipo === "Facturacion") {
          // Valores en millones
          colon = Math.floor(Math.random() * 50000000 + 40000000);
          serrano = Math.floor(Math.random() * 40000000 + 30000000);
          peron = Math.floor(Math.random() * 30000000 + 25000000);
          sanMartin = Math.floor(Math.random() * 40000000 + 35000000);
          virtual = Math.floor(Math.random() * 20000000 + 15000000);
          total = colon + serrano + peron + sanMartin + virtual;
        } else if (tipo === "Clientes") {
          // Valores en unidades
          colon = Math.floor(Math.random() * 1500 + 1000);
          serrano = Math.floor(Math.random() * 1200 + 800);
          peron = Math.floor(Math.random() * 1000 + 700);
          sanMartin = Math.floor(Math.random() * 1400 + 900);
          virtual = Math.floor(Math.random() * 600 + 300);
          total = colon + serrano + peron + sanMartin + virtual;
        } else {
          // Producto
          colon = Math.floor(Math.random() * 60 + 40);
          serrano = Math.floor(Math.random() * 50 + 30);
          peron = Math.floor(Math.random() * 40 + 25);
          sanMartin = Math.floor(Math.random() * 55 + 35);
          virtual = Math.floor(Math.random() * 25 + 15);
          total = colon + serrano + peron + sanMartin + virtual;
        }

        lines.push(
          `${fecha}\t${colon}\t${serrano}\t${peron}\t${sanMartin}\t${virtual}\t${total}\t${tipo}`
        );
      }
    }

    // Crear CSV
    const csv = lines.join("\n");

    // Retornar como descarga
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const monthName = monthNames[monthNum - 1];
    const filename = `Plantilla_${monthName}_${yearNum}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Error generating template" },
      { status: 500 }
    );
  }
}
