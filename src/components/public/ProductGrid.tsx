"use client";

import { useMemo, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";
import { formatBRL } from "@/lib/money";
import { useCart } from "@/components/cart/CartProvider";

export function ProductGrid({
  products,
  categories,
}: {
  products: CatalogProduct[];
  categories: { id: string; name: string; slug: string }[];
}) {
  const [slug, setSlug] = useState<string>("todos");
  const { addItem, has } = useCart();

  const visible = useMemo(
    () => (slug === "todos" ? products : products.filter((product) => product.category.slug === slug)),
    [products, slug],
  );

  return (
    <section id="vitrine" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Vitrine</h2>
          <p className="mt-1 text-sm opacity-75">Peças disponíveis e reservas em andamento.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSlug("todos")}
            className={`rounded-full px-3 py-1.5 text-sm ${
              slug === "todos"
                ? "bg-[var(--primary-color)] text-white"
                : "border border-[color-mix(in_srgb,var(--text-color)_18%,transparent)]"
            }`}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSlug(category.slug)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                slug === category.slug
                  ? "bg-[var(--primary-color)] text-white"
                  : "border border-[color-mix(in_srgb,var(--text-color)_18%,transparent)]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-sm opacity-70">Nenhuma peça nesta categoria no momento.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => {
            const reserved = product.status === "RESERVED";
            const inCart = has(product.id);
            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--text-color)_10%,transparent)] bg-[color-mix(in_srgb,var(--background-color)_80%,white)]"
              >
                <div className="relative aspect-[4/5] bg-black/5">
                  <img src={product.coverPath} alt={product.title} className="h-full w-full object-cover" />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1">
                    {reserved ? (
                      <span className="rounded-full bg-amber-500 px-2 py-1 text-xs font-semibold text-white">
                        ⏳ Reservado por 48h
                      </span>
                    ) : null}
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--secondary-color)] px-2 py-1 text-xs font-medium text-[var(--text-color)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-wide opacity-60">{product.category.name}</p>
                  <h3 className="font-semibold">{product.title}</h3>
                  {product.size ? <p className="text-sm opacity-70">Tam. {product.size}</p> : null}
                  <p className="text-sm opacity-80">{formatBRL(product.priceCents)}</p>
                  <button
                    type="button"
                    disabled={reserved || inCart}
                    onClick={() =>
                      addItem({
                        id: product.id,
                        title: product.title,
                        priceCents: product.priceCents,
                        coverPath: product.coverPath,
                        size: product.size,
                      })
                    }
                    className="w-full rounded-full bg-[var(--primary-color)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {reserved ? "Indisponível" : inCart ? "Na sacola" : "Adicionar à sacola"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
