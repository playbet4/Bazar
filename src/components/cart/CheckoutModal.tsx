"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

export function CheckoutModal({ onClose }: { onClose: () => void }) {
  const { items, clear } = useCart();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: items.map((item) => item.id),
          customerName: String(formData.get("customerName") ?? ""),
          customerPhone: String(formData.get("customerPhone") ?? ""),
          pickupMethod: String(formData.get("pickupMethod") ?? "LOCAL"),
        }),
      });
      const data = (await response.json()) as { error?: string; whatsappUrl?: string };
      if (!response.ok || !data.whatsappUrl) {
        setError(data.error ?? "Não foi possível finalizar.");
        setPending(false);
        return;
      }
      clear();
      window.location.href = data.whatsappUrl;
    } catch {
      setError("Falha de rede. Tente novamente.");
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <form
        action={onSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 text-stone-900 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Finalizar reserva</h2>
            <p className="mt-1 text-sm text-stone-600">
              As peças ficam reservadas por 48 horas após o envio.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-stone-500">
            Fechar
          </button>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Nome</span>
          <input
            name="customerName"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">WhatsApp</span>
          <input
            name="customerPhone"
            required
            placeholder="(11) 99999-0000"
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </label>
        <fieldset className="space-y-2 text-sm">
          <legend className="font-medium">Retirada</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name="pickupMethod" value="LOCAL" defaultChecked />
            No local
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="pickupMethod" value="APP" />
            Via aplicativo
          </label>
        </fieldset>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Reservando..." : "Reservar e abrir WhatsApp"}
        </button>
      </form>
    </div>
  );
}
