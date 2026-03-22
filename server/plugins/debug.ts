// server/plugins/debug-error.ts
export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook("error", (error, { event }) => {
        console.error("🔥 SERVER ERROR:");
        console.error(error);
        console.error(error?.stack); // 👈 quan trọng
    });
});