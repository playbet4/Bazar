"use client";

import { useEffect, useState, useTransition } from "react";
import { cancelReservation, confirmReservationSale } from "@/app/actions/reservations";

export function RemainingTime({ expiresAt }: { expiresAt: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function tick() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel("Expirada");
        return;
      }
      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      setLabel(`${hours}h ${minutes}min`);
    }
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return <span className="font-medium">{label}</span>;
}

export function ReservationActions({ reservationId }: { reservationId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await confirmReservationSale(reservationId);
              if (result.error) setError(result.error);
            })
          }
          className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          Confirmar venda
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await cancelReservation(reservationId);
              if (result.error) setError(result.error);
            })
          }
          className="rounded-md bg-stone-200 px-3 py-1.5 text-sm font-medium text-stone-900 disabled:opacity-60"
        >
          Cancelar reserva
        </button>
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
