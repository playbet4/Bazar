import { getSiteSettings } from "@/lib/settings";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { ThemeVars } from "@/components/public/ThemeVars";
import { CartProvider } from "@/components/cart/CartProvider";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <CartProvider>
      <div className="flex min-h-full flex-1 flex-col">
        <ThemeVars settings={settings} />
        <Header settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </div>
    </CartProvider>
  );
}
