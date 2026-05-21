import { NextRequest, NextResponse } from "next/server";

// Default config
const DEFAULT_CONFIG = {
  currentYear: 2026,
  currentMonth: 5,
  currentDay: 14,
  updatedAt: new Date().toISOString(),
};

/** GET /api/config */
export async function GET() {
  try {
    // Return default config
    return NextResponse.json(DEFAULT_CONFIG, { status: 200 });
  } catch (e) {
    console.error("Error in GET /api/config:", e);
    return NextResponse.json(DEFAULT_CONFIG, { status: 200 });
  }
}

/** POST /api/config — body: Partial<AppConfig> */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("POST /api/config:", body);
    
    // Return the config with updated timestamp
    const config = {
      ...DEFAULT_CONFIG,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({ ok: true, config }, { status: 200 });
  } catch (e) {
    console.error("Error in POST /api/config:", e);
    return NextResponse.json({ ok: false, error: String(e), config: DEFAULT_CONFIG }, { status: 200 });
  }
}
