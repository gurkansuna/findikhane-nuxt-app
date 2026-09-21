// Orijinal server.js'deki money(value) yardımcısının aynısı.
export function money(value: unknown): string {
  const formatted = Number(value).toFixed(2);
  return formatted.endsWith(".00") ? formatted.slice(0, -3) : formatted;
}
