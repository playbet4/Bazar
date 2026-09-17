import { isDangerousSvg, siteSettingsSchema } from "./validations";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(
  siteSettingsSchema.safeParse({
    primaryColor: "#2F5D50",
    secondaryColor: "#C4A574",
    backgroundColor: "#F7F3EC",
    textColor: "#1F2A26",
    footerAddress: "Rua A",
    footerCnpj: "00.000.000/0001-00",
    footerPhones: "11 0000-0000",
    footerEmail: "contato@bazar.local",
    instagramUrl: "https://instagram.com/bazar",
    whatsappUrl: "https://wa.me/5511999999999",
    facebookUrl: "",
    tiktokUrl: "",
    instagramVisible: true,
    whatsappVisible: true,
    facebookVisible: false,
    tiktokVisible: true,
  }).success,
  "configuração válida deveria passar",
);

assert(
  !siteSettingsSchema.safeParse({
    primaryColor: "green",
    secondaryColor: "#C4A574",
    backgroundColor: "#F7F3EC",
    textColor: "#1F2A26",
    footerAddress: "",
    footerCnpj: "",
    footerPhones: "",
    footerEmail: "",
    instagramUrl: "",
    whatsappUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    instagramVisible: true,
    whatsappVisible: true,
    facebookVisible: true,
    tiktokVisible: true,
  }).success,
  "cor inválida deveria falhar",
);

assert(
  !siteSettingsSchema.safeParse({
    primaryColor: "#2F5D50",
    secondaryColor: "#C4A574",
    backgroundColor: "#F7F3EC",
    textColor: "#1F2A26",
    footerAddress: "",
    footerCnpj: "",
    footerPhones: "",
    footerEmail: "",
    instagramUrl: "instagram.com/sem-protocolo",
    whatsappUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    instagramVisible: true,
    whatsappVisible: true,
    facebookVisible: true,
    tiktokVisible: true,
  }).success,
  "URL sem protocolo deveria falhar",
);

assert(isDangerousSvg('<svg onload="alert(1)"></svg>'), "SVG com handler deveria ser rejeitado");
assert(!isDangerousSvg('<svg><circle cx="1" cy="1" r="1"/></svg>'), "SVG simples deveria ser aceito");

console.log("validations ok");
