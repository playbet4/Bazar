import { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/tags";
import { releaseExpiredReservations } from "@/lib/reservations";

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function coverPath(images: { path: string; isCover: boolean }[]) {
  return images.find((image) => image.isCover)?.path ?? images[0]?.path ?? "/product-placeholder.svg";
}

export async function getCatalogProducts() {
  await releaseExpiredReservations();

  const products = await prisma.product.findMany({
    where: {
      status: { in: [ProductStatus.AVAILABLE, ProductStatus.RESERVED] },
    },
    include: {
      category: true,
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    priceCents: product.priceCents,
    size: product.size,
    status: product.status,
    tags: parseTags(product.tags),
    coverPath: coverPath(product.images),
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
  }));
}

export type CatalogProduct = Awaited<ReturnType<typeof getCatalogProducts>>[number];

export async function getAdminProducts() {
  await releaseExpiredReservations();

  return prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveReservations() {
  await releaseExpiredReservations();

  return prisma.reservation.findMany({
    where: { status: "ACTIVE" },
    include: {
      products: {
        include: {
          images: true,
          category: true,
        },
      },
    },
    orderBy: { expiresAt: "asc" },
  });
}
