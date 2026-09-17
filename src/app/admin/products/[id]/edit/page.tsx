import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdminProductById, getCategories } from "@/lib/catalog";
import { parseTags } from "@/lib/tags";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Editar peça" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Editar peça</h1>
          <p className="mt-1 text-sm text-stone-600">
            Altere dados, remova fotos atuais ou envie novas (máx. 3).
          </p>
        </div>
        <Link href="/admin/products" className="text-sm text-stone-600 hover:text-stone-900">
          Voltar à lista
        </Link>
      </div>
      {categories.length === 0 ? (
        <p className="text-sm text-red-700">Rode o seed para criar as categorias padrão.</p>
      ) : (
        <ProductForm
          categories={categories}
          product={{
            id: product.id,
            title: product.title,
            description: product.description,
            priceCents: product.priceCents,
            size: product.size,
            categoryId: product.categoryId,
            tags: parseTags(product.tags),
            images: product.images.map((image) => ({
              id: image.id,
              path: image.path,
              isCover: image.isCover,
            })),
          }}
        />
      )}
    </div>
  );
}
