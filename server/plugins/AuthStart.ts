import { GoogleService } from "../core/service/auth";

export default defineNitroPlugin((nitroApp) => {
  const { google } = useRuntimeConfig();
  GoogleService.CLIENT_ID = google.clientId;
  GoogleService.SECRET_ID = google.clientSecret;
});
