import type { H3Event } from "h3";
export function validatePaymentRedirects(event: H3Event, values: string[]) {
  const allowed = new Set([getRequestURL(event).origin, new URL(useRuntimeConfig(event).public.siteUrl).origin]);
  for (const value of values) {
    const url = new URL(value);
    if (!allowed.has(url.origin) || !["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      throw createError({ statusCode: 400, statusMessage: "Invalid payment redirect" });
    }
  }
}
