import { NextResponse } from "next/server";
import { getAllGold } from "@/lib/market";

/** Canlı altın fiyatları (gram, çeyrek, cumhuriyet, ons → TRY). Hesaplayıcı kullanır. */
export async function GET() {
  try {
    const gold = await getAllGold();
    return NextResponse.json(gold, {
      headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({});
  }
}
