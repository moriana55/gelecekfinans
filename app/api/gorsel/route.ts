import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BOT = path.join(process.env.HOME || "", "gelecekfinans-bot");
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams.get("p");
  if (!p) return new NextResponse(null, { status: 400 });

  const normalized = path.normalize(p);
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) {
    return new NextResponse(null, { status: 400 });
  }

  const ext = path.extname(normalized).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return new NextResponse(null, { status: 400 });
  }

  const full = path.join(BOT, normalized);
  if (!full.startsWith(BOT + path.sep) || !fs.existsSync(full)) {
    return new NextResponse(null, { status: 404 });
  }

  const buf = fs.readFileSync(full);
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg";
  return new NextResponse(buf, {
    headers: { "Content-Type": mime, "Cache-Control": "public, max-age=86400, immutable" },
  });
}
