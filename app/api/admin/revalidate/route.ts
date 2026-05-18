import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paths } = await req.json() as { paths?: string[] };

  const defaultPaths = ["/", "/sitemap.xml", "/feed.xml"];
  const allPaths = [...defaultPaths, ...(paths || [])];

  for (const p of allPaths) {
    revalidatePath(p);
  }

  return NextResponse.json({ ok: true, revalidated: allPaths });
}
