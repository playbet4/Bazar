import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@bazar.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const name = process.env.ADMIN_NAME ?? "Administrador";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash },
  });

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      logoPath: "/logo-default.svg",
      primaryColor: "#2F5D50",
      secondaryColor: "#C4A574",
      backgroundColor: "#F7F3EC",
      textColor: "#1F2A26",
      footerAddress: "Rua das Costureiras, 120 — Centro",
      footerCnpj: "00.000.000/0001-00",
      footerPhones: "(11) 4000-0000",
      footerEmail: "contato@bazarmoda.local",
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

  console.log(`Admin pronto: ${email}`);

  for (const category of [
    { name: "Feminino", slug: "feminino" },
    { name: "Masculino", slug: "masculino" },
    { name: "Utensílios", slug: "utensilios" },
  ]) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  console.log("Categorias prontas: feminino, masculino, utensilios");

  const feminine = await prisma.category.findUnique({ where: { slug: "feminino" } });
  if (feminine && (await prisma.product.count()) === 0) {
    await prisma.product.create({
      data: {
        title: "Camisa de linho seminova",
        description: "Peça única em linho, pronta para circular de novo.",
        priceCents: 8900,
        size: "M",
        tags: JSON.stringify(["Seminovo", "Peça Única"]),
        categoryId: feminine.id,
        images: {
          create: [{ path: "/product-placeholder.svg", isCover: true, sortOrder: 0 }],
        },
      },
    });
    console.log("Peça de exemplo cadastrada.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
