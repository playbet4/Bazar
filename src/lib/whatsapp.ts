import type { PickupMethod, Product } from "@prisma/client";
import { formatBRL } from "@/lib/money";
import { RESERVATION_HOURS } from "@/lib/constants";

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function extractWhatsAppNumber(urlOrNumber: string | null | undefined) {
  if (!urlOrNumber) return "";
  const digits = digitsOnly(urlOrNumber);
  if (digits.length < 10) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function resolveBusinessWhatsApp(whatsappUrl: string) {
  return extractWhatsAppNumber(process.env.CHECKOUT_WHATSAPP) || extractWhatsAppNumber(whatsappUrl);
}

export function buildWhatsAppCheckoutLink(input: {
  businessNumber: string;
  customerName: string;
  customerPhone: string;
  pickupMethod: PickupMethod;
  products: Pick<Product, "title" | "priceCents" | "size">[];
  expiresAt: Date;
}) {
  const lines = [
    `Olá! Gostaria de confirmar a reserva de ${RESERVATION_HOURS}h no Bazar Moda Sustentável.`,
    "",
    "Peças:",
    ...input.products.map((product) => {
      const size = product.size ? ` (tam. ${product.size})` : "";
      return `• ${product.title}${size} — ${formatBRL(product.priceCents)}`;
    }),
    "",
    `Total: ${formatBRL(input.products.reduce((sum, product) => sum + product.priceCents, 0))}`,
    `Nome: ${input.customerName}`,
    `WhatsApp: ${input.customerPhone}`,
    `Retirada: ${input.pickupMethod === "LOCAL" ? "No local" : "Via aplicativo"}`,
    `Reserva válida até: ${input.expiresAt.toLocaleString("pt-BR")}`,
  ];

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${input.businessNumber}?text=${text}`;
}
