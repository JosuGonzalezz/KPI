import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("POST body:", body);

    const { periodType, year, month, data } = body;

    if (!periodType || year === undefined || month === undefined || !data) {
      console.error("Missing required fields:", { periodType, year, month, hasData: !!data });
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 200 });
    }

    const records = [
      {
        period_type: periodType,
        year: Number(year),
        month: Number(month),
        metric_type: "Facturacion",
        colon: Number(data.facturacion?.colon) || 0,
        serrano: Number(data.facturacion?.serrano) || 0,
        peron: Number(data.facturacion?.peron) || 0,
        san_martin: Number(data.facturacion?.sanMartin) || 0,
        virtual: Number(data.facturacion?.virtual) || 0,
        total: Number(data.facturacion?.total) || 0,
      },
      {
        period_type: periodType,
        year: Number(year),
        month: Number(month),
        metric_type: "Clientes",
        colon: Number(data.clientes?.colon) || 0,
        serrano: Number(data.clientes?.serrano) || 0,
        peron: Number(data.clientes?.peron) || 0,
        san_martin: Number(data.clientes?.sanMartin) || 0,
        virtual: Number(data.clientes?.virtual) || 0,
        total: Number(data.clientes?.total) || 0,
      },
      {
        period_type: periodType,
        year: Number(year),
        month: Number(month),
        metric_type: "Producto",
        colon: Number(data.producto?.colon) || 0,
        serrano: Number(data.producto?.serrano) || 0,
        peron: Number(data.producto?.peron) || 0,
        san_martin: Number(data.producto?.sanMartin) || 0,
        virtual: Number(data.producto?.virtual) || 0,
        total: Number(data.producto?.total) || 0,
      },
    ];

    console.log("Inserting records:", records);

    const { data: insertedData, error } = await supabase
      .from("period_comparatives")
      .upsert(records, { onConflict: "period_type,year,month,metric_type" });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
    }

    console.log("Successfully inserted:", insertedData);
    return NextResponse.json({ ok: true, message: "Data saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const periodType = searchParams.get("periodType");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!periodType || !year || !month) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const { data, error } = await supabase
      .from("period_comparatives")
      .select("*")
      .eq("period_type", periodType)
      .eq("year", Number(year))
      .eq("month", Number(month));

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
