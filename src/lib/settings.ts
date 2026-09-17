import { prisma } from "@/lib/prisma";
import { DEFAULT_FOOTER, DEFAULT_THEME } from "@/lib/constants";
import type { SiteSettings } from "@prisma/client";

export async function getSiteSettings(): Promise<SiteSettings> {
  const existing = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (existing) return existing;

  return prisma.siteSettings.create({
    data: {
      id: 1,
      logoPath: "/logo-default.svg",
      ...DEFAULT_THEME,
      ...DEFAULT_FOOTER,
      instagramUrl: "",
      whatsappUrl: "",
      facebookUrl: "",
      tiktokUrl: "",
      instagramVisible: true,
      whatsappVisible: true,
      facebookVisible: true,
      tiktokVisible: true,
    },
  });
}

export function visibleSocialLinks(settings: SiteSettings) {
  return [
    {
      key: "instagram" as const,
      label: "Instagram",
      href: settings.instagramUrl,
      visible: settings.instagramVisible,
    },
    {
      key: "whatsapp" as const,
      label: "WhatsApp",
      href: settings.whatsappUrl,
      visible: settings.whatsappVisible,
    },
    {
      key: "facebook" as const,
      label: "Facebook",
      href: settings.facebookUrl,
      visible: settings.facebookVisible,
    },
    {
      key: "tiktok" as const,
      label: "TikTok",
      href: settings.tiktokUrl,
      visible: settings.tiktokVisible,
    },
  ].filter((item) => item.visible && item.href.trim().length > 0);
}
