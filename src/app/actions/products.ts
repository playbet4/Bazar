"use server";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
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

function revalidateCatalog(productId?: string) {
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/reservas");
  if (productId) {
    revalidatePath(`/admin/products/${productId}/edit`);
  }
}

async function saveProductImages(files: File[], startOrder = 0) {
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
      isCover: false,
      sortOrder: startOrder + index,
    });
  }

  return saved;
}

async function deleteUploadedFile(publicPath: string) {
  if (!publicPath.startsWith("/uploads/products/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", publicPath));
  } catch {
    // arquivo pode já ter sido removido
  }
}

function parseProductForm(formData: FormData) {
  return productFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priceCents: parsePriceToCents(String(formData.get("price") ?? "")) ?? Number.NaN,
    size: String(formData.get("size") ?? "").trim() || undefined,
    categoryId: formData.get("categoryId"),
    tags: formData.getAll("tags").map(String),
  });
}

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();

  const files = formData
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0);

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  if (files.length < 1 || files.length > MAX_PRODUCT_IMAGES) {
    return { error: `Envie de 1 a ${MAX_PRODUCT_IMAGES} fotos.` };
  }

  let images;
  try {
    images = await saveProductImages(files);
    if (images[0]) images[0].isCover = true;
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

export async function updateProduct(
  productId: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!existing) {
    return { error: "Produto não encontrado." };
  }

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const keepIds = formData.getAll("keepImageIds").map(String);
  const validKeep = existing.images.filter((image) => keepIds.includes(image.id));
  const newFiles = formData
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0);

  const totalImages = validKeep.length + newFiles.length;
  if (totalImages < 1) {
    return { error: "Mantenha ou envie pelo menos 1 foto." };
  }
  if (totalImages > MAX_PRODUCT_IMAGES) {
    return { error: `No máximo ${MAX_PRODUCT_IMAGES} fotos por peça.` };
  }

  let uploaded;
  try {
    uploaded = newFiles.length > 0 ? await saveProductImages(newFiles, validKeep.length) : [];
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Falha no upload." };
  }

  const removed = existing.images.filter((image) => !keepIds.includes(image.id));

  await prisma.$transaction(async (tx) => {
    if (removed.length > 0) {
      await tx.productImage.deleteMany({
        where: { id: { in: removed.map((image) => image.id) } },
      });
    }

    if (uploaded.length > 0) {
      await tx.productImage.createMany({
        data: uploaded.map((image, index) => ({
          productId,
          path: image.path,
          sortOrder: validKeep.length + index,
          isCover: false,
        })),
      });
    }

    const remaining = await tx.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });

    // Reordena mantidas + novas e define a primeira como capa
    const ordered = [
      ...validKeep.map((image) => image.id),
      ...remaining
        .filter((image) => !validKeep.some((kept) => kept.id === image.id))
        .map((image) => image.id),
    ];

    for (const [index, imageId] of ordered.entries()) {
      await tx.productImage.update({
        where: { id: imageId },
        data: { sortOrder: index, isCover: index === 0 },
      });
    }

    await tx.product.update({
      where: { id: productId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priceCents: parsed.data.priceCents,
        size: parsed.data.size ?? null,
        categoryId: parsed.data.categoryId,
        tags: serializeTags(parsed.data.tags),
      },
    });
  });

  for (const image of removed) {
    await deleteUploadedFile(image.path);
  }

  revalidateCatalog(productId);
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

  revalidateCatalog(productId);
  return { ok: true };
}
