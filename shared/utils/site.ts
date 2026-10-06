export function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
}
export function isAdsenseClientId(value: unknown): value is string {
  return typeof value === "string" && /^ca-pub-\d{16}$/.test(value);
}
export function isEnabled(value: unknown): boolean {
  return value === true || value === "true";
}
