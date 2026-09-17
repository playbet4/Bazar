"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct, type ProductActionState } from "@/app/actions/products";
import { MAX_PRODUCT_IMAGES, PRODUCT_TAG_OPTIONS } from "@/lib/constants";

const initial: ProductActionState = {};

export function ProductForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createProduct, initial);

  useEffect(() => {
    if (state.ok) {
      router.push("/admin/products");
    }
  }, [router, state.ok]);

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6">
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Título</span>
        <input name="title" required className="w-full rounded-lg border border-stone-300 px-3 py-2" />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Descrição</span>
        <textarea name="description" required rows={4} className="w-full rounded-lg border border-stone-300 px-3 py-2" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Preço (R$)</span>
          <input name="price" required placeholder="89,90" className="w-full rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Tamanho (opcional)</span>
          <input name="size" placeholder="M" className="w-full rounded-lg border border-stone-300 px-3 py-2" />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Categoria</span>
        <select name="categoryId" required className="w-full rounded-lg border border-stone-300 px-3 py-2">
          <option value="">Selecione</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="space-y-2 text-sm">
        <legend className="font-medium">Etiquetas visuais</legend>
        <div className="flex flex-wrap gap-3">
          {PRODUCT_TAG_OPTIONS.map((tag) => (
            <label key={tag} className="flex items-center gap-2">
              <input type="checkbox" name="tags" value={tag} />
              {tag}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Fotos (1 a {MAX_PRODUCT_IMAGES}, a primeira é a capa)</span>
        <input
          type="file"
          name="images"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          required
          className="block w-full text-sm"
        />
      </label>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Cadastrar peça"}
      </button>
    </form>
  );
}
