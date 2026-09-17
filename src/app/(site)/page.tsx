import { getSiteSettings } from "@/lib/settings";
import { getCatalogProducts, getCategories } from "@/lib/catalog";
import { ProductGrid } from "@/components/public/ProductGrid";

export default async function HomePage() {
  const [settings, products, categories] = await Promise.all([
    getSiteSettings(),
    getCatalogProducts(),
    getCategories(),
  ]);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--secondary-color)]">
          Moda com história
        </p>
        <h1
          className="mt-4 max-w-3xl text-4xl leading-tight sm:text-6xl"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Peças escolhidas a dedo para circular de novo.
        </h1>
        <p className="mt-6 max-w-2xl text-lg/8 text-[color-mix(in_srgb,var(--text-color)_80%,white)]">
          Reserve pelo WhatsApp. A peça fica sua por 48 horas até a confirmação da retirada.
        </p>
        <div className="mt-8">
          <a
            href="#vitrine"
            className="inline-flex rounded-full bg-[var(--primary-color)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Ver vitrine
          </a>
        </div>
      </section>

      <ProductGrid products={products} categories={categories} />

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="text-2xl font-semibold">Fale com o bazar</h2>
        <p className="mt-3 max-w-xl text-sm/7 opacity-80">
          {settings.footerPhones ? `Telefone: ${settings.footerPhones}. ` : null}
          {settings.footerEmail
            ? `E-mail: ${settings.footerEmail}.`
            : "Os contatos aparecem aqui quando preenchidos no painel."}
        </p>
      </section>
    </div>
  );
}
