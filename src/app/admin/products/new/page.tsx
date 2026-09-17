import { getCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nova peça" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Cadastro expresso</h1>
        <p className="mt-1 text-sm text-stone-600">
          Até 3 fotos, categoria, preço e etiquetas visuais.
        </p>
      </div>
      {categories.length === 0 ? (
        <p className="text-sm text-red-700">Rode o seed para criar as categorias padrão.</p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </div>
  );
}
