export function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function parsePriceToCents(raw: string) {
  const normalized = raw.trim().replace(/\s/g, "").replace("R$", "").replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function formatPriceInput(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}
