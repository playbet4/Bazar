export const SITE_NAME = "Bazar Moda Sustentável";

/** Rota oculta de login — não linkada no site público. */
export const ADMIN_ACCESS_PATH = "/acesso";

export const SESSION_COOKIE = "bazar_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
export const ALLOWED_LOGO_TYPES = ["image/png", "image/svg+xml"] as const;
export const ALLOWED_LOGO_EXTENSIONS = [".png", ".svg"] as const;

export const MAX_PRODUCT_IMAGES = 3;
export const MAX_PRODUCT_IMAGE_BYTES = 3 * 1024 * 1024;
export const ALLOWED_PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_PRODUCT_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export const RESERVATION_HOURS = 48;
export const CART_STORAGE_KEY = "bazar-sacola";

export const PRODUCT_TAG_OPTIONS = ["Promoção", "Seminovo", "Peça Única"] as const;

export const DEFAULT_CATEGORIES = [
  { name: "Feminino", slug: "feminino" },
  { name: "Masculino", slug: "masculino" },
  { name: "Utensílios", slug: "utensilios" },
] as const;

export const DEFAULT_THEME = {
  primaryColor: "#2F5D50",
  secondaryColor: "#C4A574",
  backgroundColor: "#F7F3EC",
  textColor: "#1F2A26",
} as const;

export const DEFAULT_FOOTER = {
  footerAddress: "Rua das Costureiras, 120 — Centro",
  footerCnpj: "00.000.000/0001-00",
  footerPhones: "(11) 4000-0000",
  footerEmail: "contato@bazarmoda.local",
} as const;

export const SOCIAL_NETWORKS = [
  { key: "instagram", label: "Instagram", urlField: "instagramUrl", visibleField: "instagramVisible" },
  { key: "whatsapp", label: "WhatsApp", urlField: "whatsappUrl", visibleField: "whatsappVisible" },
  { key: "facebook", label: "Facebook", urlField: "facebookUrl", visibleField: "facebookVisible" },
  { key: "tiktok", label: "TikTok", urlField: "tiktokUrl", visibleField: "tiktokVisible" },
] as const;

export type SocialKey = (typeof SOCIAL_NETWORKS)[number]["key"];
