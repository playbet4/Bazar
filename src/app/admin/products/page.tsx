import Link from "next/link";
import { coverPath, getAdminProducts } from "@/lib/catalog";
import { formatBRL } from "@/lib/money";
import { parseTags } from "@/lib/tags";
import { ProductStatusSelect } from "@/components/admin/ProductStatusSelect";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="mt-1 text-sm text-stone-600">Estoque e status das peças.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
        >
          Nova peça
        </Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Foto</th>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-stone-500">
                  Nenhuma peça cadastrada.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3">
                    <img
                      src={coverPath(product.images)}
                      alt=""
                      className="h-14 w-14 rounded-md object-cover"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.title}</p>
                    <p className="text-xs text-stone-500">
                      {product.category.name}
                      {parseTags(product.tags).length > 0
                        ? ` · ${parseTags(product.tags).join(", ")}`
                        : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">{formatBRL(product.priceCents)}</td>
                  <td className="px-4 py-3">
                    <ProductStatusSelect productId={product.id} status={product.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
