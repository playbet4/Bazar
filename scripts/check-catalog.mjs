import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = await prisma.product.findMany({
  select: { id: true, title: true, status: true },
});
console.log("products", products);

const reservations = await prisma.reservation.findMany({
  select: {
    id: true,
    status: true,
    customerName: true,
    expiresAt: true,
    products: { select: { title: true, status: true } },
  },
});
console.log("reservations", JSON.stringify(reservations, null, 2));

await prisma.$disconnect();
