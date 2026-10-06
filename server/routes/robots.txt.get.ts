export default defineEventHandler(event => {
  const { siteUrl } = useRuntimeConfig(event).public;
  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");
  return ["User-agent: *", "Allow: /", "Disallow: /console", "Disallow: /auth/", "Disallow: /api/", "Disallow: /data/", "Disallow: /cart", "Disallow: /payment", "Disallow: /profile", "Disallow: /orders", "Disallow: /library", `Sitemap: ${new URL("/sitemap.xml", siteUrl).href}`, ""].join("\n");
});
