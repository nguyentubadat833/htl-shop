export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();
  console.info("[Startup] Environment:", config.nodeProduction ? "production" : "development");
  // Credentials must never be written to logs.
});
