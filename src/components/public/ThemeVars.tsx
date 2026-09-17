import type { SiteSettings } from "@prisma/client";

export function ThemeVars({ settings }: { settings: SiteSettings }) {
  const css = `
:root {
  --primary-color: ${settings.primaryColor};
  --secondary-color: ${settings.secondaryColor};
  --background-color: ${settings.backgroundColor};
  --text-color: ${settings.textColor};
  --background: ${settings.backgroundColor};
  --foreground: ${settings.textColor};
}
`.trim();

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
