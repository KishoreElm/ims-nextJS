import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
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

    // Accept new payload structure
    const body = await request.json();
    const { ticket, date, issuedBy, issuedTo, items } = body;

    if (
      !ticket ||
      !date ||
      !issuedBy ||
      !issuedTo ||
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
      const { itemId, quantity, serialNumber, description } = item;

      if (!itemId || !quantity) {
        continue; // skip invalid
      }

      // Check item exists and stock
      const dbItem = await prisma.item.findUnique({
        where: { id: itemId },
      });

      if (!dbItem) {
        results.push({ error: `Item not found: ${itemId}` });
        continue;
      }

      if (dbItem.availableStock < quantity) {
        results.push({ error: `Insufficient stock for item: ${dbItem.name}` });
        continue;
      }

      // Create issue record
      const issueItem = await prisma.issueItem.create({
        data: {
          ticket,
          quantity,
          date: new Date(date),
          serialNumber: serialNumber || "",
          description: description || "",
          issuedBy,
          issuedTo,
          item: { connect: { id: itemId } },
          user: { connect: { id: issuedTo } },
        },
      });

      // Update item stock
      await prisma.item.update({
        where: { id: itemId },
        data: {
          totalIssued: {
            increment: quantity,
          },
          availableStock: {
            decrement: quantity,
          },
        },
      });

      results.push(issueItem);
    }

    return NextResponse.json({ success: true, results }, { status: 201 });
  } catch (error) {
    console.error("Error issuing item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
