import Link from "next/link";
import type { SiteSettings } from "@prisma/client";
import { SITE_NAME } from "@/lib/constants";
import { CartButton } from "@/components/cart/CartButton";

export function Header({ settings }: { settings: SiteSettings }) {
  const logoSrc = settings.logoPath || "/logo-default.svg";

  return (
    <header className="border-b border-[color-mix(in_srgb,var(--text-color)_12%,transparent)] bg-[color-mix(in_srgb,var(--background-color)_92%,white)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <img
            src={logoSrc}
            alt={SITE_NAME}
            className="h-10 w-auto max-w-[160px] object-contain sm:h-12 sm:max-w-[220px]"
          />
          <span className="truncate text-sm font-semibold tracking-wide sm:text-base">
            {SITE_NAME}
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm sm:gap-4">
          <Link href="/#vitrine" className="hover:text-[var(--primary-color)]">
            Vitrine
          </Link>
          <CartButton />
          <Link href="/login" className="text-[var(--primary-color)] hover:opacity-80">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
