import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = {
  title: "Personalização",
};

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Personalização e configurações gerais</h1>
        <p className="mt-1 text-sm text-stone-600">
          Alterações aqui alimentam a tabela `site_settings` e o site público na hora.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
