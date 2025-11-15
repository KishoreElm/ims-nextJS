import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const vendor = searchParams.get("vendor") || "";
    const startMonth = searchParams.get("startMonth");
    const endMonth = searchParams.get("endMonth");

    // Sorting
    const sortField =
      searchParams.get("sortField") || "date"; // date | vendor | amount
    const sortOrder =
      searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // WHERE Filter Object
    let where: any = {};

    // Vendor search
    if (vendor.trim() !== "") {
      where.vendor = {
        contains: vendor,
        mode: "insensitive",
      };
    }

    // Date range
    if (startMonth && endMonth) {
      where.date = {
        gte: new Date(`${startMonth}-01T00:00:00.000Z`),
        lte: new Date(`${endMonth}-31T23:59:59.999Z`),
      };
    }

    // Fetch data
    const purchases = await prisma.purchase.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortField]: sortOrder,
      },
    });

    const total = await prisma.purchase.count({ where });

    return NextResponse.json({
      data: purchases,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases", details: String(error) },
      { status: 500 }
    );
  }
}
