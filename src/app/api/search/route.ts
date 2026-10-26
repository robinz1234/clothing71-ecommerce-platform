import { NextResponse } from "next/server";
import { searchProductsCatalog } from "@/lib/catalog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const results = await searchProductsCatalog(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("[Search API] Error executing search:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
