import { NextResponse } from "next/server";
import { getAllFx } from "@/lib/market";

/** Canlı döviz kurları (USD/EUR/GBP → TRY). Çevirici ve şerit bileşenleri kullanır. */
export async function GET() {
  try {
    const fx = await getAllFx();
    return NextResponse.json(fx, {
      headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({});
  }
}
