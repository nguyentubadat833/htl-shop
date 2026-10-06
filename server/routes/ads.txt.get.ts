import { isAdsenseClientId } from "#shared/utils/site";
export default defineEventHandler(event => {
  const { adsenseClientId } = useRuntimeConfig(event).public;
  if (!isAdsenseClientId(adsenseClientId)) throw createError({ statusCode: 404 });
  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");
  return `google.com, ${adsenseClientId.slice(3)}, DIRECT, f08c47fec0942fa0\n`;
});
