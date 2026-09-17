-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logoPath" TEXT,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "footerAddress" TEXT NOT NULL,
    "footerCnpj" TEXT NOT NULL,
    "footerPhones" TEXT NOT NULL,
    "footerEmail" TEXT NOT NULL,
    "instagramUrl" TEXT NOT NULL,
    "instagramVisible" BOOLEAN NOT NULL DEFAULT true,
    "whatsappUrl" TEXT NOT NULL,
    "whatsappVisible" BOOLEAN NOT NULL DEFAULT true,
    "facebookUrl" TEXT NOT NULL,
    "facebookVisible" BOOLEAN NOT NULL DEFAULT true,
    "tiktokUrl" TEXT NOT NULL,
    "tiktokVisible" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
