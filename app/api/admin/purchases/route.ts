import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as any;

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all purchases with item and user details
    const purchases = await prisma.purchase.findMany({
      include: {
        item: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as any;
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Accept new payload structure
    const body = await request.json();
    const { vendor, billNumber, poNumber, date, items } = body;
    if (
      !vendor ||
      !billNumber ||
      !date ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const results = [];
    for (const item of items) {
      const { itemId, quantity, unitType, amount, taxRate, serialNumbers } =
        item;
      if (!itemId || !quantity || !unitType || !amount) {
        continue; // skip invalid
      }
      // Create purchase record
      const purchase = await prisma.purchase.create({
        data: {
          itemId,
          userId: decoded.userId,
          quantity,
          unitType,
          amount,
          taxRate: typeof taxRate === "number" ? taxRate : 18,
          vendor,
          billNumber,
          poNumber: poNumber || "",
          date: new Date(date),
        },
      });
      // Add serial numbers
      if (
        serialNumbers &&
        Array.isArray(serialNumbers) &&
        serialNumbers.length > 0
      ) {
        for (const sn of serialNumbers) {
          await prisma.purchaseSerialNumber.create({
            data: {
              purchaseId: purchase.id,
              serial: sn,
            },
          });
        }
      }
      // Update item stock
      await prisma.item.update({
        where: { id: itemId },
        data: {
          totalPurchased: { increment: quantity },
          availableStock: { increment: quantity },
        },
      });
      results.push(purchase);
    }
    return NextResponse.json({ success: true, results }, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
