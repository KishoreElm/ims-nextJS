// app/api/admin/vendors/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.purchase.findMany({
      select: { vendor: true },
      distinct: ["vendor"],
      orderBy: { vendor: "asc" },
    });

    const vendors = rows.map((r) => r.vendor).filter(Boolean);
    return NextResponse.json(vendors);
  } catch (err) {
    console.error("vendors API error:", err);
    return NextResponse.json({ error: "Failed to load vendors" }, { status: 500 });
  }
}
