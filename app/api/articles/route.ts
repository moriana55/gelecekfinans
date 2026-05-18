import { NextResponse } from "next/server";
import { getAllArticles } from "@/lib/articles";

export async function GET() {
  const articles = (await getAllArticles()).map(a => ({
    title: a.title, meta: a.meta, category: a.category,
    slug: a.slug, image_path: a.image_path,
  }));
  return NextResponse.json(articles);
}
