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

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current year and month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Get monthly purchase data for the last 6 months
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i - 1, 1);
      const nextMonth = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth() + 1,
        1
      );

      const monthPurchases = await prisma.purchase.findMany({
        where: {
          date: {
            gte: targetDate,
            lt: nextMonth,
          },
        },
        include: {
          item: {
            select: {
              name: true,
              unitType: true,
            },
          },
        },
      });

      const totalAmount = monthPurchases.reduce(
        (sum: number, purchase: any) => sum + Number(purchase.amount),
        0
      );
      const totalItems = monthPurchases.reduce(
        (sum: number, purchase: any) => sum + Number(purchase.quantity),
        0
      );
      const uniqueItems = new Set(monthPurchases.map((p: any) => p.itemId))
        .size;

      monthlyData.push({
        month: targetDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        totalAmount,
        totalItems,
        uniqueItems,
        purchases: monthPurchases.length,
      });
    }

    return NextResponse.json(monthlyData);
  } catch (error) {
    console.error("Error fetching monthly purchases:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
