"use client";

import { useActionState, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { SiteSettings } from "@prisma/client";
import { updateSiteSettings, uploadLogo, type SettingsState } from "@/app/actions/settings";
import { MAX_LOGO_BYTES, SOCIAL_NETWORKS } from "@/lib/constants";

const initial: SettingsState = {};

function ColorField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-stone-800">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded border border-stone-300 bg-white"
          aria-label={label}
        />
        <input
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          pattern="^#([0-9A-Fa-f]{6})$"
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm uppercase"
        />
      </div>
    </label>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [colors, setColors] = useState({
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    backgroundColor: settings.backgroundColor,
    textColor: settings.textColor,
  });
  const [saveState, saveAction, saving] = useActionState(updateSiteSettings, initial);
  const [logoState, logoAction, uploading] = useActionState(uploadLogo, initial);
  const [logoName, setLogoName] = useState("");

  useEffect(() => {
    setColors({
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      backgroundColor: settings.backgroundColor,
      textColor: settings.textColor,
    });
  }, [settings]);

  const previewStyle = useMemo(
    () =>
      ({
        "--primary-color": colors.primaryColor,
        "--secondary-color": colors.secondaryColor,
        "--background-color": colors.backgroundColor,
        "--text-color": colors.textColor,
      }) as CSSProperties,
    [colors],
  );

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Identidade visual (logo)</h2>
        <p className="mt-1 text-sm text-stone-600">
          PNG ou SVG, até 2 MB. A logomarca substitui o cabeçalho do site público.
        </p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-28 w-full max-w-xs items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4">
            <img
              src={settings.logoPath || "/logo-default.svg"}
              alt="Logomarca atual"
              className="max-h-20 w-auto max-w-full object-contain"
            />
          </div>
          <form action={logoAction} className="flex-1 space-y-3">
            <input
              type="file"
              name="logo"
              accept=".png,.svg,image/png,image/svg+xml"
              required
              onChange={(event) => setLogoName(event.target.files?.[0]?.name ?? "")}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-stone-900 file:px-3 file:py-2 file:text-white"
            />
            {logoName ? (
              <p className="text-xs text-stone-500">
                {logoName} · limite {Math.round(MAX_LOGO_BYTES / 1024 / 1024)} MB
              </p>
            ) : null}
            {logoState.error ? <p className="text-sm text-red-700">{logoState.error}</p> : null}
            {logoState.ok ? <p className="text-sm text-emerald-700">Logomarca atualizada.</p> : null}
            <button
              type="submit"
              disabled={uploading}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {uploading ? "Enviando..." : "Enviar logomarca"}
            </button>
          </form>
        </div>
      </section>

      <form action={saveAction} className="space-y-10">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Paleta de cores</h2>
          <p className="mt-1 text-sm text-stone-600">
            As cores viram variáveis CSS globais (`--primary-color`, `--secondary-color`, etc.).
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <ColorField
              name="primaryColor"
              label="Cor primária"
              value={colors.primaryColor}
              onChange={(value) => setColors((current) => ({ ...current, primaryColor: value }))}
            />
            <ColorField
              name="secondaryColor"
              label="Cor secundária"
              value={colors.secondaryColor}
              onChange={(value) => setColors((current) => ({ ...current, secondaryColor: value }))}
            />
            <ColorField
              name="backgroundColor"
              label="Cor de fundo"
              value={colors.backgroundColor}
              onChange={(value) => setColors((current) => ({ ...current, backgroundColor: value }))}
            />
            <ColorField
              name="textColor"
              label="Cor dos textos"
              value={colors.textColor}
              onChange={(value) => setColors((current) => ({ ...current, textColor: value }))}
            />
          </div>
          <div
            style={previewStyle}
            className="mt-6 overflow-hidden rounded-xl border border-stone-200"
          >
            <div className="bg-[var(--background-color)] p-5 text-[var(--text-color)]">
              <p className="text-xs uppercase tracking-widest text-[var(--secondary-color)]">Prévia</p>
              <p className="mt-2 font-semibold">Título com a paleta escolhida</p>
              <button
                type="button"
                className="mt-3 rounded-full bg-[var(--primary-color)] px-4 py-1.5 text-sm text-white"
              >
                Botão primário
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Informações do rodapé</h2>
          <div className="mt-4 grid gap-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Endereço físico</span>
              <textarea
                name="footerAddress"
                rows={3}
                defaultValue={settings.footerAddress}
                className="w-full rounded-lg border border-stone-300 px-3 py-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">CNPJ</span>
              <input
                name="footerCnpj"
                defaultValue={settings.footerCnpj}
                className="w-full rounded-lg border border-stone-300 px-3 py-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Telefones de contato</span>
              <textarea
                name="footerPhones"
                rows={2}
                defaultValue={settings.footerPhones}
                className="w-full rounded-lg border border-stone-300 px-3 py-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">E-mail</span>
              <input
                name="footerEmail"
                type="email"
                defaultValue={settings.footerEmail}
                className="w-full rounded-lg border border-stone-300 px-3 py-2"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Redes sociais</h2>
          <p className="mt-1 text-sm text-stone-600">
            Deixe a URL vazia ou desmarque “Exibir” para ocultar o link no site.
          </p>
          <div className="mt-4 space-y-4">
            {SOCIAL_NETWORKS.map((network) => (
              <div
                key={network.key}
                className="grid gap-3 rounded-xl border border-stone-100 bg-stone-50 p-4 sm:grid-cols-[1fr_auto] sm:items-end"
              >
                <label className="block space-y-1">
                  <span className="text-sm font-medium">{network.label}</span>
                  <input
                    name={network.urlField}
                    type="url"
                    placeholder="https://"
                    defaultValue={settings[network.urlField] ?? ""}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
                  />
                </label>
                <label className="flex items-center gap-2 pb-2 text-sm">
                  <input
                    type="checkbox"
                    name={network.visibleField}
                    defaultChecked={settings[network.visibleField]}
                    className="h-4 w-4"
                  />
                  Exibir no site
                </label>
              </div>
            ))}
          </div>
        </section>

        {saveState.error ? <p className="text-sm text-red-700">{saveState.error}</p> : null}
        {saveState.ok ? (
          <p className="text-sm text-emerald-700">Configurações salvas. O site público já usa os novos valores.</p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--primary-color,#2F5D50)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
      </form>
    </div>
  );
}
