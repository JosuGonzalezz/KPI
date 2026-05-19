import { NextRequest, NextResponse } from "next/server";
import { getAllRecords, getConfig } from "@/lib/store";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "dashboard"; // "dashboard" | "data"

    const config = await getConfig();
    const records = await getAllRecords();

    if (type === "data") {
      // Exportar tabla de datos cargados
      return exportDataTable(records, config);
    }

    // Por defecto, retornar instrucciones
    return NextResponse.json({
      message: "Use ?type=data to export data table",
    });
  } catch (error) {
    console.error("[v0] Export PDF error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

function exportDataTable(records: any[], config: any): NextResponse {
  const { currentYear, currentMonth, currentDay } = config;

  // Formatear números
  const fmtNum = (n: number | null, tipo: string): string => {
    if (!n) return "—";
    if (tipo === "Facturacion")
      return "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
    return n.toLocaleString("es-AR");
  };

  // Agrupar por tipo de métrica
  const grouped = records.reduce(
    (acc: any, rec: any) => {
      if (!acc[rec.tipo]) acc[rec.tipo] = [];
      acc[rec.tipo].push(rec);
      return acc;
    },
    {}
  );

  // Generar HTML
  let html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reporte de Datos Cargados</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; background: #fff; }
        .container { padding: 20px; max-width: 100%; }
        .header { margin-bottom: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 15px; }
        .header h1 { font-size: 24px; color: #1e40af; margin-bottom: 5px; }
        .header p { font-size: 12px; color: #666; }
        .section { margin-bottom: 25px; page-break-inside: avoid; }
        .section-title { font-size: 16px; font-weight: 600; color: #fff; background: #1e40af; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #f0f0f0; padding: 8px; text-align: left; font-weight: 600; border: 1px solid #ddd; }
        td { padding: 8px; border: 1px solid #eee; }
        tr:nth-child(even) { background: #f9f9f9; }
        .fecha { font-weight: 500; color: #1e40af; }
        .number { text-align: right; font-family: 'Courier New', monospace; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 10px; color: #666; }
        @media print { body { margin: 0; padding: 0; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reporte de Datos Cargados</h1>
          <p>Período: ${currentDay}/${currentMonth}/${currentYear} | Generado: ${new Date().toLocaleString("es-AR")}</p>
        </div>
  `;

  // Agregar tabla por cada tipo de métrica
  Object.entries(grouped).forEach(([tipo, records]: [string, any]) => {
    const sorted = [...records].sort((a: any, b: any) => {
      const dateA = new Date(a.fecha);
      const dateB = new Date(b.fecha);
      return dateB.getTime() - dateA.getTime();
    });

    html += `
      <div class="section">
        <div class="section-title">${tipo} (${sorted.length} días)</div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th class="number">Colón</th>
              <th class="number">Serrano</th>
              <th class="number">Perón</th>
              <th class="number">San Martín</th>
              <th class="number">Virtual</th>
              <th class="number">Total</th>
            </tr>
          </thead>
          <tbody>
    `;

    sorted.forEach((rec: any) => {
      const fecha = new Date(rec.fecha).toLocaleDateString("es-AR");
      html += `
        <tr>
          <td class="fecha">${fecha}</td>
          <td class="number">${fmtNum(rec.colon, tipo)}</td>
          <td class="number">${fmtNum(rec.serrano, tipo)}</td>
          <td class="number">${fmtNum(rec.peron, tipo)}</td>
          <td class="number">${fmtNum(rec.sanmartin, tipo)}</td>
          <td class="number">${fmtNum(rec.virtual, tipo)}</td>
          <td class="number"><strong>${fmtNum(rec.total, tipo)}</strong></td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;
  });

  html += `
        <div class="footer">
          <p>Reporte generado automáticamente por Sistema de Control Cadena</p>
          <p>Base de datos local | Listo para integración con Supabase</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
