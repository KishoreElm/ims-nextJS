// app/api/admin/recent-purchases/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET || "fallback-secret"); // verify only

    const id = params.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await request.json();
    // Only allow certain fields to be updated
    const allowed: Partial<Record<string, any>> = {};
    if (typeof body.vendor === "string") allowed.vendor = body.vendor;
    if (typeof body.billNumber === "string") allowed.billNumber = body.billNumber;
    if (body.quantity !== undefined) allowed.quantity = body.quantity;
    if (typeof body.unitType === "string") allowed.unitType = body.unitType;
    if (body.amount !== undefined) allowed.amount = body.amount;
    if (body.date) allowed.date = new Date(body.date);
    if (typeof body.poNumber === "string") allowed.poNumber = body.poNumber;

    const updated = await prisma.purchase.update({
      where: { id },
      data: allowed,
      select: {
        id: true,
        vendor: true,
        billNumber: true,
        quantity: true,
        unitType: true,
        amount: true,
        date: true,
        poNumber: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Patch purchase error:", err);
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update purchase" }, { status: 500 });
  }
}
