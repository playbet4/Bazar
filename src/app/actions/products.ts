"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { parsePriceToCents } from "@/lib/money";
import { serializeTags } from "@/lib/tags";
import { productFormSchema, productStatusSchema } from "@/lib/validations";
import {
  ALLOWED_PRODUCT_IMAGE_EXTENSIONS,
  ALLOWED_PRODUCT_IMAGE_TYPES,
  MAX_PRODUCT_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
} from "@/lib/constants";

export type ProductActionState = {
  ok?: boolean;
  error?: string;
};

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/reservas");
}

async function saveProductImages(files: File[]) {
  if (files.length < 1 || files.length > MAX_PRODUCT_IMAGES) {
    throw new Error(`Envie de 1 a ${MAX_PRODUCT_IMAGES} fotos.`);
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadsDir, { recursive: true });

  const saved: { path: string; isCover: boolean; sortOrder: number }[] = [];

  for (const [index, file] of files.entries()) {
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      throw new Error("Cada foto deve ter no máximo 3 MB.");
    }

    const extension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_PRODUCT_IMAGE_EXTENSIONS.includes(extension as (typeof ALLOWED_PRODUCT_IMAGE_EXTENSIONS)[number])) {
      throw new Error("Use fotos JPG, PNG ou WEBP.");
    }

    if (
      file.type &&
      !ALLOWED_PRODUCT_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_PRODUCT_IMAGE_TYPES)[number])
    ) {
      throw new Error("Tipo de imagem inválido.");
    }

    const filename = `product-${randomUUID()}${extension}`;
    await writeFile(path.join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()));
    saved.push({
      path: `/uploads/products/${filename}`,
      isCover: index === 0,
      sortOrder: index,
    });
  }

  return saved;
}

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();

  const files = formData
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0);

  const parsed = productFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priceCents: parsePriceToCents(String(formData.get("price") ?? "")),
    size: String(formData.get("size") ?? "").trim() || undefined,
    categoryId: formData.get("categoryId"),
    tags: formData.getAll("tags").map(String),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let images;
  try {
    images = await saveProductImages(files);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Falha no upload." };
  }

  await prisma.product.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      priceCents: parsed.data.priceCents,
      size: parsed.data.size,
      categoryId: parsed.data.categoryId,
      tags: serializeTags(parsed.data.tags),
      images: { create: images },
    },
  });

  revalidateCatalog();
  return { ok: true };
}

export async function updateProductStatus(productId: string, status: string) {
  await requireAdmin();
  const parsed = productStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { error: "Status inválido." };
  }

  await prisma.product.update({
    where: { id: productId },
    data: { status: parsed.data as ProductStatus },
  });

  if (parsed.data === "AVAILABLE") {
    const active = await prisma.reservation.findMany({
      where: { status: "ACTIVE", products: { some: { id: productId } } },
      include: { products: true },
    });

    for (const reservation of active) {
      const othersReserved = reservation.products.filter(
        (product) => product.id !== productId && product.status === "RESERVED",
      );
      if (othersReserved.length === 0) {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: "CANCELLED" },
        });
      }
    }
  }

  revalidateCatalog();
  return { ok: true };
}
