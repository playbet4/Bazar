"use client";

import { useState } from "react";
import { formatBRL } from "@/lib/money";
import { useCart } from "@/components/cart/CartProvider";
import { CheckoutModal } from "@/components/cart/CheckoutModal";

export function CartButton() {
  const { items, totalCents, removeItem } = useCart();
  const [open, setOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative rounded-full border border-[color-mix(in_srgb,var(--text-color)_18%,transparent)] px-3 py-1.5 text-sm hover:border-[var(--primary-color)]"
      >
        Sacola
        {items.length > 0 ? (
          <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--primary-color)] px-1.5 text-xs text-white">
            {items.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <button className="h-full flex-1" aria-label="Fechar sacola" onClick={() => setOpen(false)} />
          <aside className="flex h-full w-full max-w-md flex-col bg-[var(--background-color)] text-[var(--text-color)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <h2 className="text-lg font-semibold">Sacola</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm opacity-70">
                Fechar
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="text-sm opacity-70">Nenhuma peça na sacola.</p>
              ) : (
                items.map((item) => (
                  <article key={item.id} className="flex gap-3">
                    <img src={item.coverPath} alt="" className="h-16 w-16 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="text-sm opacity-70">{formatBRL(item.priceCents)}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="mt-1 text-xs underline"
                      >
                        Remover
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
            <div className="border-t border-black/10 px-5 py-4">
              <p className="mb-3 text-sm">
                Total: <strong>{formatBRL(totalCents)}</strong>
              </p>
              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => setCheckout(true)}
                className="w-full rounded-full bg-[var(--primary-color)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Finalizar
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {checkout ? <CheckoutModal onClose={() => setCheckout(false)} /> : null}
    </>
  );
}
