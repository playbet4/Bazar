"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { releaseExpiredReservations } from "@/lib/reservations";

function revalidateReservations() {
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/reservas");
}

export async function confirmReservationSale(reservationId: string) {
  await requireAdmin();
  await releaseExpiredReservations();

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { products: true },
  });

  if (!reservation || reservation.status !== "ACTIVE") {
    return { error: "Reserva não encontrada ou já encerrada." };
  }

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CONFIRMED" },
    }),
    prisma.product.updateMany({
      where: { id: { in: reservation.products.map((product) => product.id) } },
      data: { status: "SOLD" },
    }),
  ]);

  revalidateReservations();
  return { ok: true };
}

export async function cancelReservation(reservationId: string) {
  await requireAdmin();
  await releaseExpiredReservations();

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { products: true },
  });

  if (!reservation || reservation.status !== "ACTIVE") {
    return { error: "Reserva não encontrada ou já encerrada." };
  }

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" },
    }),
    prisma.product.updateMany({
      where: {
        id: { in: reservation.products.map((product) => product.id) },
        status: "RESERVED",
      },
      data: { status: "AVAILABLE" },
    }),
  ]);

  revalidateReservations();
  return { ok: true };
}
