import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({
    ga4Id: settings.ga4Id || null,
    adsenseId: settings.adsenseId || null,
    adSlots: settings.adSlots || {},
  }, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
