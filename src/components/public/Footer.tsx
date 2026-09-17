import type { SiteSettings } from "@prisma/client";
import { SITE_NAME } from "@/lib/constants";
import { visibleSocialLinks } from "@/lib/settings";

export function Footer({ settings }: { settings: SiteSettings }) {
  const socials = visibleSocialLinks(settings);

  return (
    <footer className="mt-auto border-t border-[color-mix(in_srgb,var(--text-color)_12%,transparent)] bg-[var(--primary-color)] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--secondary-color)]">
            {SITE_NAME}
          </p>
          {settings.footerAddress ? (
            <p className="mt-3 whitespace-pre-line text-sm/6 opacity-90">{settings.footerAddress}</p>
          ) : null}
        </div>
        <div className="text-sm/7 opacity-90">
          {settings.footerCnpj ? <p>CNPJ: {settings.footerCnpj}</p> : null}
          {settings.footerPhones ? (
            <p className="whitespace-pre-line">Telefone: {settings.footerPhones}</p>
          ) : null}
          {settings.footerEmail ? (
            <p>
              E-mail:{" "}
              <a className="underline decoration-white/40 underline-offset-4" href={`mailto:${settings.footerEmail}`}>
                {settings.footerEmail}
              </a>
            </p>
          ) : null}
        </div>
        <div>
          <p className="text-sm font-medium">Redes sociais</p>
          {socials.length === 0 ? (
            <p className="mt-2 text-sm opacity-75">Nenhuma rede publicada no momento.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {socials.map((item) => (
                <li key={item.key}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-white/40 underline-offset-4 hover:text-[var(--secondary-color)]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
