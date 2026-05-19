import { NextRequest, NextResponse } from "next/server";
import { getConfig, saveConfig } from "@/lib/supabase-store";

/** GET /api/config */
export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config);
}

/** POST /api/config — body: Partial<AppConfig> */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config = await saveConfig(body);
    return NextResponse.json({ ok: true, config });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
