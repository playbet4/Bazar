import { coverPath, getActiveReservations } from "@/lib/catalog";
import { formatBRL } from "@/lib/money";
import { RemainingTime, ReservationActions } from "@/components/admin/ReservationActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reservas" };

export default async function ReservationsPage() {
  const reservations = await getActiveReservations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reservas ativas</h1>
        <p className="mt-1 text-sm text-stone-600">
          Confirme a venda ou cancele para devolver a peça ao estoque.
        </p>
      </div>
      {reservations.length === 0 ? (
        <p className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-600">
          Nenhuma reserva ativa.
        </p>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <article key={reservation.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{reservation.customerName}</p>
                  <p className="text-sm text-stone-600">{reservation.customerPhone}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    Retirada: {reservation.pickupMethod === "LOCAL" ? "No local" : "App"} · Restam{" "}
                    <RemainingTime expiresAt={reservation.expiresAt.toISOString()} />
                  </p>
                </div>
                <ReservationActions reservationId={reservation.id} />
              </div>
              <ul className="mt-4 divide-y divide-stone-100">
                {reservation.products.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 py-2">
                    <img
                      src={coverPath(product.images)}
                      alt=""
                      className="h-12 w-12 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.title}</p>
                      <p className="text-xs text-stone-500">{formatBRL(product.priceCents)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
