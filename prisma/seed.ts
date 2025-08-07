// import { PrismaClient } from '@prisma/client'
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Create users
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: "hashedpassword",
      role: "ADMIN",
      isApproved: true,
    },
  });
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Normal User",
      password: "hashedpassword",
      role: "USER",
      isApproved: true,
    },
  });

  // Create items
  const item1 = await prisma.item.create({
    data: {
      name: "Laptop",
      unitType: "PCS",
      category: "Electronics",
      description: "A dummy laptop",
      totalPurchased: 10,
      totalIssued: 2,
      availableStock: 8,
    },
  });
  const item2 = await prisma.item.create({
    data: {
      name: "Cable",
      unitType: "M",
      category: "Accessories",
      description: "A dummy cable",
      totalPurchased: 100,
      totalIssued: 20,
      availableStock: 80,
    },
  });

  // Create purchases
  const purchase1 = await prisma.purchase.create({
    data: {
      itemId: item1.id,
      userId: admin.id,
      quantity: 5,
      unitType: "PCS",
      amount: 50000,
      taxRate: 18,
      vendor: "Vendor A",
      billNumber: "BILL123",
      poNumber: "PO123",
      date: new Date(),
      serialNumbers: {
        create: [{ serial: "SN-LAP-001" }, { serial: "SN-LAP-002" }],
      },
    },
  });
  const purchase2 = await prisma.purchase.create({
    data: {
      itemId: item2.id,
      userId: admin.id,
      quantity: 50,
      unitType: "M",
      amount: 1000,
      taxRate: 18,
      vendor: "Vendor B",
      billNumber: "BILL456",
      poNumber: "PO456",
      date: new Date(),
      serialNumbers: {
        create: [{ serial: "SN-CAB-001" }, { serial: "SN-CAB-002" }],
      },
    },
  });

  // Create issue items
  await prisma.issueItem.create({
    data: {
      itemId: item1.id,
      userId: user.id,
      quantity: 1,
      date: new Date(),
      ticket: "TICKET-001",
      serialNumber: "SN-LAP-001",
      description: "Issued for project X",
      issuedBy: admin.name,
      issuedTo: user.id,
    },
  });
  await prisma.issueItem.create({
    data: {
      itemId: item2.id,
      userId: user.id,
      quantity: 10,
      date: new Date(),
      ticket: "TICKET-002",
      serialNumber: "SN-CAB-001",
      description: "Issued for lab",
      issuedBy: admin.name,
      issuedTo: user.id,
    },
  });

  console.log("Dummy data seeded!");
}

// main().catch(e => {
//   console.error(e)
//   process.exit(1)
// }).finally(() => prisma.$disconnect())
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
