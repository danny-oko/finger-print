import { NextResponse } from "next/server";

import { d1Query } from "@/lib/d1";

export async function GET() {
  try {
    const rows = await d1Query<{ name: string }>(
      "SELECT name FROM churches ORDER BY name ASC LIMIT 500",
    );

    return NextResponse.json({ churches: rows.map((r) => r.name) });
  } catch (error) {
    console.error("Failed to load churches", error);
    return NextResponse.json({ churches: [] }, { status: 200 });
  }
}
