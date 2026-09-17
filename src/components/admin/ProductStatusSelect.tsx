"use client";

import { useTransition } from "react";
import type { ProductStatus } from "@prisma/client";
import { updateProductStatus } from "@/app/actions/products";

const LABELS: Record<ProductStatus, string> = {
  AVAILABLE: "Disponível",
  RESERVED: "Reservado",
  SOLD: "Vendido",
};

export function ProductStatusSelect({
  productId,
  status,
}: {
  productId: string;
  status: ProductStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value;
        startTransition(async () => {
          await updateProductStatus(productId, next);
        });
      }}
      className="rounded-md border border-stone-300 bg-white px-2 py-1 text-sm"
    >
      {(Object.keys(LABELS) as ProductStatus[]).map((value) => (
        <option key={value} value={value}>
          {LABELS[value]}
        </option>
      ))}
    </select>
  );
}
