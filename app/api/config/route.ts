import { NextRequest, NextResponse } from "next/server";
import { getConfig, saveConfig } from "@/lib/store";

/** GET /api/config */
export async function GET() {
  return NextResponse.json(getConfig());
}

/** POST /api/config — body: Partial<AppConfig> */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config = saveConfig(body);
    return NextResponse.json({ ok: true, config });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
