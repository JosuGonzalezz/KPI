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

    const { date, data } = body;

    if (!date || !data) {
      console.error("Missing required fields:", { date, hasData: !!data });
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 200 });
    }

    const record = {
      date,
      colon_programados: Number(data.colon?.programados) || 0,
      colon_presentes: Number(data.colon?.presentes) || 0,
      serrano_programados: Number(data.serrano?.programados) || 0,
      serrano_presentes: Number(data.serrano?.presentes) || 0,
      peron_programados: Number(data.peron?.programados) || 0,
      peron_presentes: Number(data.peron?.presentes) || 0,
      san_martin_programados: Number(data.sanMartin?.programados) || 0,
      san_martin_presentes: Number(data.sanMartin?.presentes) || 0,
      virtual_programados: Number(data.virtual?.programados) || 0,
      virtual_presentes: Number(data.virtual?.presentes) || 0,
    };

    console.log("Inserting record:", record);

    const { data: insertedData, error } = await supabase
      .from("rrhh_data")
      .upsert(record, { onConflict: "date" });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
    }

    console.log("Successfully inserted:", insertedData);
    return NextResponse.json({ ok: true, message: "RRHH data saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 200 });
  }
}

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

    return NextResponse.json({ data: data || null }, { status: 200 });
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json({ data: null }, { status: 200 });
  }
}
