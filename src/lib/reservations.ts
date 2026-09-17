import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Expiração automática (proposta atual, para revisão):
 * não há cron/worker. Sempre que o catálogo, o checkout ou o admin de reservas
 * for consultado, reservas ACTIVE com expiresAt <= agora viram EXPIRED e as
 * peças RESERVED voltam para AVAILABLE.
 *
 * Alternativa futura: job a cada minuto (Vercel cron / node-cron).
 */
export async function releaseExpiredReservations() {
  const now = new Date();
  const expired = await prisma.reservation.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    include: { products: { select: { id: true, status: true } } },
  });

  if (expired.length === 0) return 0;

  await prisma.$transaction(
    expired.flatMap((reservation) => {
      const productUpdates = reservation.products
        .filter((product) => product.status === "RESERVED")
        .map((product) =>
          prisma.product.update({
            where: { id: product.id },
            data: { status: "AVAILABLE" },
          }),
        );

      return [
        prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: "EXPIRED" },
        }),
        ...productUpdates,
      ];
    }),
  );

  return expired.length;
}

export function remainingMs(expiresAt: Date) {
  return Math.max(0, expiresAt.getTime() - Date.now());
}

export type ReservationWithProducts = Prisma.ReservationGetPayload<{
  include: {
    products: {
      include: { images: true; category: true };
    };
  };
}>;
