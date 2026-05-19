import { NextRequest, NextResponse } from "next/server";
import { getAllRecords, getRecordsByYearMonth, upsertRecords, deleteByYearMonth, parseCSV } from "@/lib/supabase-server";

/** GET /api/data?year=2026&month=5  — devuelve registros */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year  = searchParams.get("year");
  const month = searchParams.get("month");

  if (year && month) {
    const records = await getRecordsByYearMonth(Number(year), Number(month));
    return NextResponse.json({ records, count: records.length });
  }

  const records = await getAllRecords();
  return NextResponse.json({ records, count: records.length });
}

/** POST /api/data  — body: { csvText: string } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { csvText?: string; records?: unknown[] };

    // Opción A: vienen registros ya parseados
    if (body.records && Array.isArray(body.records)) {
      const result = await upsertRecords(body.records as Parameters<typeof upsertRecords>[0]);
      return NextResponse.json({ ok: true, ...result });
    }

    // Opción B: viene CSV crudo
    if (body.csvText) {
      const { records, errors } = await parseCSV(body.csvText);
      if (records.length === 0) {
        return NextResponse.json({ ok: false, errors }, { status: 400 });
      }
      const result = await upsertRecords(records);
      return NextResponse.json({ ok: true, ...result, errors, total: records.length });
    }

    return NextResponse.json({ ok: false, error: "Se requiere csvText o records" }, { status: 400 });
  } catch (e) {
    console.error("Error in POST /api/data:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/** DELETE /api/data?year=2026&month=5  — elimina un mes */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year  = searchParams.get("year");
  const month = searchParams.get("month");
  if (!year || !month) {
    return NextResponse.json({ ok: false, error: "year y month requeridos" }, { status: 400 });
  }
  const deleted = await deleteByYearMonth(Number(year), Number(month));
  return NextResponse.json({ ok: true, deleted });
}
