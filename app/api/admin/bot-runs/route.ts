import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const runs = await prisma.botRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ runs });
}
