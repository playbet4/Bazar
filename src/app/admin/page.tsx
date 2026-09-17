import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";

export default async function AdminHomePage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Visão geral</h1>
        <p className="mt-1 text-sm text-stone-600">
          Gerencie a identidade do Bazar Moda Sustentável a partir deste painel.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-stone-500">Logo</p>
          <img
            src={settings.logoPath || "/logo-default.svg"}
            alt=""
            className="mt-3 h-12 w-auto max-w-full object-contain"
          />
        </article>
        <article className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-stone-500">Paleta</p>
          <div className="mt-3 flex gap-2">
            {[settings.primaryColor, settings.secondaryColor, settings.backgroundColor, settings.textColor].map(
              (color) => (
                <span
                  key={color}
                  className="h-8 w-8 rounded-full border border-stone-200"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ),
            )}
          </div>
        </article>
        <article className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-stone-500">Contato</p>
          <p className="mt-3 text-sm">{settings.footerEmail || "E-mail ainda não definido"}</p>
        </article>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products"
          className="inline-flex rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
        >
          Produtos
        </Link>
        <Link
          href="/admin/reservas"
          className="inline-flex rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium"
        >
          Reservas
        </Link>
        <Link
          href="/admin/configuracoes"
          className="inline-flex rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium"
        >
          Personalização
        </Link>
      </div>
    </div>
  );
}
