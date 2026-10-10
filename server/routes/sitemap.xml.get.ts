import { escapeXml } from "#shared/utils/site";
import { policyPaths } from '#shared/utils/policies';
export default defineEventHandler(async event => {
  const { siteUrl } = useRuntimeConfig(event).public;
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { alias: true, updatedAt: true },
    orderBy: { id: "asc" },
    take: 50000 - 2 - policyPaths.length,
  });
  const entries = [
    ...["/", "/about", ...policyPaths].map(path => `<url><loc>${escapeXml(new URL(path, siteUrl).href)}</loc></url>`),
    ...products.map(product => `<url><loc>${escapeXml(new URL(`/model/${encodeURIComponent(product.alias)}`, siteUrl).href)}</loc><lastmod>${product.updatedAt.toISOString()}</lastmod></url>`),
  ];
  setResponseHeader(event, "Content-Type", "application/xml; charset=utf-8");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</urlset>`;
});
