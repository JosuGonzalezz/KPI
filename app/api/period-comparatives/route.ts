import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const periodType = searchParams.get("periodType");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!periodType || !year || !month) {
      return NextResponse.json({ error: "Missing parameters", data: [] }, { status: 200 });
    }

    const { data, error } = await supabase
      .from("period_comparatives")
      .select("*")
      .eq("period_type", periodType)
      .eq("year", parseInt(year))
      .eq("month", parseInt(month));

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message, data: [] }, { status: 200 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Error fetching period comparatives:", error);
    return NextResponse.json({ error: String(error), data: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    const { periodType, year, month, data } = body;

    if (!periodType || year === undefined || month === undefined || !data) {
      console.error("Missing parameters:", { periodType, year, month, data });
      return NextResponse.json({ ok: false, error: "Missing parameters" }, { status: 400 });
    }

    const records = [
      {
        period_type: periodType,
        year: parseInt(year),
        month: parseInt(month),
        metric_type: "Facturacion",
        colon: data.facturacion?.colon || 0,
        serrano: data.facturacion?.serrano || 0,
        peron: data.facturacion?.peron || 0,
        san_martin: data.facturacion?.sanMartin || 0,
        virtual: data.facturacion?.virtual || 0,
        total: data.facturacion?.total || 0,
      },
      {
        period_type: periodType,
        year: parseInt(year),
        month: parseInt(month),
        metric_type: "Clientes",
        colon: data.clientes?.colon || 0,
        serrano: data.clientes?.serrano || 0,
        peron: data.clientes?.peron || 0,
        san_martin: data.clientes?.sanMartin || 0,
        virtual: data.clientes?.virtual || 0,
        total: data.clientes?.total || 0,
      },
      {
        period_type: periodType,
        year: parseInt(year),
        month: parseInt(month),
        metric_type: "Producto",
        colon: data.producto?.colon || 0,
        serrano: data.producto?.serrano || 0,
        peron: data.producto?.peron || 0,
        san_martin: data.producto?.sanMartin || 0,
        virtual: data.producto?.virtual || 0,
        total: data.producto?.total || 0,
      },
    ];

    const { error } = await supabase
      .from("period_comparatives")
      .upsert(records, { onConflict: "period_type,year,month,metric_type" });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "Data saved successfully" });
  } catch (error) {
    console.error("Error saving period comparatives:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const periodType = searchParams.get("periodType");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!periodType || !year || !month) {
      return NextResponse.json({ ok: false, error: "Missing parameters" }, { status: 400 });
    }

    const { error } = await supabase
      .from("period_comparatives")
      .delete()
      .eq("period_type", periodType)
      .eq("year", parseInt(year))
      .eq("month", parseInt(month));

    if (error) throw error;

    return NextResponse.json({ ok: true, message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting period comparatives:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
