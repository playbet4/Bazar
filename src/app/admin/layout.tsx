import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { ADMIN_ACCESS_PATH } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Painel",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect(ADMIN_ACCESS_PATH);
  }

  return (
    <div className="flex min-h-full flex-1 bg-stone-100 text-stone-900">
      <aside className="hidden w-64 flex-col bg-stone-950 p-5 text-stone-200 sm:flex">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Backoffice</p>
        <p className="mt-2 text-lg font-semibold text-white">Bazar</p>
        <nav className="mt-8 flex flex-col gap-1 text-sm">
          <Link href="/admin" className="rounded-md px-3 py-2 hover:bg-stone-800">
            Visão geral
          </Link>
          <Link href="/admin/products" className="rounded-md px-3 py-2 hover:bg-stone-800">
            Produtos
          </Link>
          <Link href="/admin/reservas" className="rounded-md px-3 py-2 hover:bg-stone-800">
            Reservas
          </Link>
          <Link href="/admin/configuracoes" className="rounded-md px-3 py-2 hover:bg-stone-800">
            Personalização
          </Link>
          <Link href="/" className="rounded-md px-3 py-2 hover:bg-stone-800">
            Ver site público
          </Link>
        </nav>
        <div className="mt-auto">
          <p className="mb-2 truncate px-1 text-xs text-stone-500">{session.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 sm:hidden">
          <span className="font-semibold">Bazar Admin</span>
          <LogoutButton />
        </header>
        <div className="flex-1 p-4 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
