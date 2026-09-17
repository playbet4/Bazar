"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  updateProduct,
  type ProductActionState,
} from "@/app/actions/products";
import { MAX_PRODUCT_IMAGES, PRODUCT_TAG_OPTIONS } from "@/lib/constants";
import { formatPriceInput } from "@/lib/money";

const initial: ProductActionState = {};

export type ProductFormImage = {
  id: string;
  path: string;
  isCover: boolean;
};

export type ProductFormValues = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  size: string | null;
  categoryId: string;
  tags: string[];
  images: ProductFormImage[];
};

export function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: ProductFormValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const boundUpdate = useMemo(
    () => (product ? updateProduct.bind(null, product.id) : null),
    [product],
  );
  const [state, action, pending] = useActionState(
    boundUpdate ?? createProduct,
    initial,
  );
  const [keptImages, setKeptImages] = useState<ProductFormImage[]>(product?.images ?? []);
  const [newFileCount, setNewFileCount] = useState(0);

  useEffect(() => {
    if (state.ok) {
      router.push("/admin/products");
      router.refresh();
    }
  }, [router, state.ok]);

  const totalAfterSave = keptImages.length + newFileCount;
  const slotsLeft = MAX_PRODUCT_IMAGES - keptImages.length;

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6">
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Título</span>
        <input
          name="title"
          required
          defaultValue={product?.title}
          className="w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Descrição</span>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={product?.description}
          className="w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Preço (R$)</span>
          <input
            name="price"
            required
            placeholder="89,90"
            defaultValue={product ? formatPriceInput(product.priceCents) : undefined}
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Tamanho (opcional)</span>
          <input
            name="size"
            placeholder="M"
            defaultValue={product?.size ?? undefined}
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Categoria</span>
        <select
          name="categoryId"
          required
          defaultValue={product?.categoryId ?? ""}
          className="w-full rounded-lg border border-stone-300 px-3 py-2"
        >
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
              <input
                type="checkbox"
                name="tags"
                value={tag}
                defaultChecked={product?.tags.includes(tag)}
              />
              {tag}
            </label>
          ))}
        </div>
      </fieldset>

      {isEdit ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Fotos atuais</p>
          {keptImages.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhuma foto mantida. Envie novas abaixo.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {keptImages.map((image, index) => (
                <div key={image.id} className="relative overflow-hidden rounded-xl border border-stone-200">
                  <img src={image.path} alt="" className="aspect-square w-full object-cover" />
                  <input type="hidden" name="keepImageIds" value={image.id} />
                  {index === 0 ? (
                    <span className="absolute left-2 top-2 rounded bg-stone-900/80 px-2 py-0.5 text-[10px] font-medium text-white">
                      Capa
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setKeptImages((current) => current.filter((item) => item.id !== image.id))}
                    className="absolute bottom-2 right-2 rounded bg-white/95 px-2 py-1 text-xs font-medium text-red-700 shadow"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-stone-500">
            A primeira foto da lista permanece como capa. Total após salvar: {totalAfterSave}/{MAX_PRODUCT_IMAGES}.
          </p>
        </div>
      ) : null}

      <label className="block space-y-1 text-sm">
        <span className="font-medium">
          {isEdit
            ? `Adicionar fotos (${slotsLeft > 0 ? `até ${slotsLeft}` : "limite atingido"})`
            : `Fotos (1 a ${MAX_PRODUCT_IMAGES}, a primeira é a capa)`}
        </span>
        <input
          type="file"
          name="images"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          required={!isEdit}
          disabled={isEdit && slotsLeft <= 0}
          onChange={(event) => setNewFileCount(event.target.files?.length ?? 0)}
          className="block w-full text-sm"
        />
      </label>

      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending || (isEdit && totalAfterSave < 1) || totalAfterSave > MAX_PRODUCT_IMAGES}
          className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar peça"}
        </button>
      </div>
    </form>
  );
}
