"use server";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { getSiteSettings } from "@/lib/settings";
import { siteSettingsSchema, isDangerousSvg } from "@/lib/validations";
import {
  ALLOWED_LOGO_EXTENSIONS,
  ALLOWED_LOGO_TYPES,
  MAX_LOGO_BYTES,
} from "@/lib/constants";

export type SettingsState = {
  ok?: boolean;
  error?: string;
};

function formBoolean(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

export async function updateSiteSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireAdmin();

  const parsed = siteSettingsSchema.safeParse({
    primaryColor: formData.get("primaryColor"),
    secondaryColor: formData.get("secondaryColor"),
    backgroundColor: formData.get("backgroundColor"),
    textColor: formData.get("textColor"),
    footerAddress: formData.get("footerAddress") ?? "",
    footerCnpj: formData.get("footerCnpj") ?? "",
    footerPhones: formData.get("footerPhones") ?? "",
    footerEmail: formData.get("footerEmail") ?? "",
    instagramUrl: formData.get("instagramUrl") ?? "",
    whatsappUrl: formData.get("whatsappUrl") ?? "",
    facebookUrl: formData.get("facebookUrl") ?? "",
    tiktokUrl: formData.get("tiktokUrl") ?? "",
    instagramVisible: formBoolean(formData, "instagramVisible"),
    whatsappVisible: formBoolean(formData, "whatsappVisible"),
    facebookVisible: formBoolean(formData, "facebookVisible"),
    tiktokVisible: formBoolean(formData, "tiktokVisible"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: {
      id: 1,
      logoPath: "/logo-default.svg",
      ...parsed.data,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes");
  return { ok: true };
}

export async function uploadLogo(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireAdmin();

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo PNG ou SVG." };
  }

  if (file.size > MAX_LOGO_BYTES) {
    return { error: "A logomarca deve ter no máximo 2 MB." };
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_LOGO_EXTENSIONS.includes(extension as (typeof ALLOWED_LOGO_EXTENSIONS)[number])) {
    return { error: "Formato inválido. Envie PNG ou SVG." };
  }

  if (!ALLOWED_LOGO_TYPES.includes(file.type as (typeof ALLOWED_LOGO_TYPES)[number])) {
    return { error: "Tipo de arquivo inválido. Envie PNG ou SVG." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (extension === ".svg" || file.type === "image/svg+xml") {
    const svg = buffer.toString("utf8");
    if (isDangerousSvg(svg)) {
      return { error: "SVG rejeitado por conter conteúdo potencialmente inseguro." };
    }
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `logo-${randomUUID()}${extension}`;
  const dest = path.join(uploadsDir, filename);
  await writeFile(dest, buffer);

  const current = await getSiteSettings();
  if (current.logoPath?.startsWith("/uploads/")) {
    const previous = path.join(process.cwd(), "public", current.logoPath);
    try {
      await unlink(previous);
    } catch {
      // arquivo antigo pode não existir
    }
  }

  await prisma.siteSettings.update({
    where: { id: 1 },
    data: { logoPath: `/uploads/${filename}` },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes");
  return { ok: true };
}
