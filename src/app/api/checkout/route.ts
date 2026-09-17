import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations";
import { getSiteSettings } from "@/lib/settings";
import { releaseExpiredReservations } from "@/lib/reservations";
import { buildWhatsAppCheckoutLink, resolveBusinessWhatsApp } from "@/lib/whatsapp";
import { RESERVATION_HOURS } from "@/lib/constants";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  await releaseExpiredReservations();

  const settings = await getSiteSettings();
  const businessNumber = resolveBusinessWhatsApp(settings.whatsappUrl);
  if (!businessNumber) {
    return NextResponse.json(
      {
        error:
          "WhatsApp da loja não configurado. Preencha a URL do WhatsApp em Personalização ou CHECKOUT_WHATSAPP.",
      },
      { status: 400 },
    );
  }

  const { productIds, customerName, customerPhone, pickupMethod } = parsed.data;
  const uniqueIds = [...new Set(productIds)];

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: uniqueIds } },
      });

      if (products.length !== uniqueIds.length) {
        throw new Error("Uma ou mais peças não existem mais.");
      }

      const unavailable = products.filter((product) => product.status !== "AVAILABLE");
      if (unavailable.length > 0) {
        throw new Error("Há peças indisponíveis na sacola. Atualize e tente de novo.");
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + RESERVATION_HOURS * 60 * 60 * 1000);

      const created = await tx.reservation.create({
        data: {
          customerName,
          customerPhone,
          pickupMethod,
          expiresAt,
          products: { connect: uniqueIds.map((id) => ({ id })) },
        },
        include: { products: true },
      });

      await tx.product.updateMany({
        where: { id: { in: uniqueIds } },
        data: { status: "RESERVED" },
      });

      return created;
    });

    const whatsappUrl = buildWhatsAppCheckoutLink({
      businessNumber,
      customerName,
      customerPhone,
      pickupMethod,
      products: reservation.products,
      expiresAt: reservation.expiresAt,
    });

    return NextResponse.json({
      ok: true,
      reservationId: reservation.id,
      expiresAt: reservation.expiresAt.toISOString(),
      whatsappUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível criar a reserva.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
