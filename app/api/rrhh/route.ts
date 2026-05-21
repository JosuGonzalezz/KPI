import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const { data, error } = await supabase
      .from("rrhh_data")
      .select("*")
      .eq("date", date)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase error:", error);
      return NextResponse.json({ data: null }, { status: 200 });
    }

    return NextResponse.json({ data: data || null });
  } catch (error) {
    console.error("Error fetching RRHH data:", error);
    return NextResponse.json({ data: null }, { status: 200 });
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

    const { date, data } = body;

    if (!date || !data) {
      console.error("Missing parameters:", { date, data });
      return NextResponse.json({ ok: false, error: "Missing parameters" }, { status: 400 });
    }

    const { error } = await supabase
      .from("rrhh_data")
      .upsert(
        {
          date,
          colon_programados: data.colon?.programados || 0,
          colon_presentes: data.colon?.presentes || 0,
          serrano_programados: data.serrano?.programados || 0,
          serrano_presentes: data.serrano?.presentes || 0,
          peron_programados: data.peron?.programados || 0,
          peron_presentes: data.peron?.presentes || 0,
          san_martin_programados: data.sanMartin?.programados || 0,
          san_martin_presentes: data.sanMartin?.presentes || 0,
          virtual_programados: data.virtual?.programados || 0,
          virtual_presentes: data.virtual?.presentes || 0,
        },
        { onConflict: "date" }
      );

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "RRHH data saved successfully" });
  } catch (error) {
    console.error("Error saving RRHH data:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
