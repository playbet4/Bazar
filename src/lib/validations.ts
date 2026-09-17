import { z } from "zod";

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9A-Fa-f]{6})$/, "Use uma cor hexadecimal no formato #RRGGBB.");

function optionalHttpUrl(label: string) {
  return z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, `${label}: informe uma URL válida iniciando com http:// ou https://.`);
}

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});

export const siteSettingsSchema = z.object({
  primaryColor: hexColor,
  secondaryColor: hexColor,
  backgroundColor: hexColor,
  textColor: hexColor,
  footerAddress: z.string().trim().max(2000, "Endereço muito longo."),
  footerCnpj: z.string().trim().max(32, "CNPJ muito longo."),
  footerPhones: z.string().trim().max(200, "Telefones muito longos."),
  footerEmail: z
    .string()
    .trim()
    .max(200)
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Informe um e-mail de contato válido.",
    }),
  instagramUrl: optionalHttpUrl("Instagram"),
  whatsappUrl: optionalHttpUrl("WhatsApp"),
  facebookUrl: optionalHttpUrl("Facebook"),
  tiktokUrl: optionalHttpUrl("TikTok"),
  instagramVisible: z.boolean(),
  whatsappVisible: z.boolean(),
  facebookVisible: z.boolean(),
  tiktokVisible: z.boolean(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export function isDangerousSvg(content: string) {
  const lowered = content.toLowerCase();
  return (
    lowered.includes("<script") ||
    lowered.includes("javascript:") ||
    /on[a-z]+\s*=/.test(lowered)
  );
}

export const productFormSchema = z.object({
  title: z.string().trim().min(2, "Informe o título da peça.").max(120),
  description: z.string().trim().min(4, "Informe uma descrição.").max(4000),
  priceCents: z.number().int().positive("Informe um preço válido."),
  size: z.string().trim().max(32).optional(),
  categoryId: z.string().min(1, "Selecione uma categoria."),
  tags: z.array(z.string().trim().min(1)).max(8),
});

export const checkoutSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1, "A sacola está vazia."),
  customerName: z.string().trim().min(2, "Informe o nome.").max(120),
  customerPhone: z
    .string()
    .trim()
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 13;
    }, "Informe um WhatsApp válido com DDD."),
  pickupMethod: z.enum(["LOCAL", "APP"]),
});

export const productStatusSchema = z.enum(["AVAILABLE", "RESERVED", "SOLD"]);

