import { OAuth2Client } from "google-auth-library";
import { VerifyCodeRequestSchema } from "#shared/schemas/auth";
import { UserAuthClient } from "#shared/types/auth";

export default defineEventHandler(async (event) => {
  const { code } = zodValidateRequestOrThrow(VerifyCodeRequestSchema, await readBody(event));
  if (!code) {
    throw createError({ statusCode: 403 });
  }

  const { google } = useRuntimeConfig(event);
  const client = new OAuth2Client(google.clientId, google.clientSecret, "postmessage");
  const { tokens } = await client.getToken(code);
  console.log("Tokens:", tokens);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: useRuntimeConfig(event).public.googleClientId,
  });
  const payload = ticket.getPayload();

  console.log("Google user:", payload);

  if (!payload?.email) {
    throw createError({ statusCode: 403, message: "Email not found in Google payload" });
  }

  const response: UserAuthClient = {
    email: payload.email,
    name: payload?.name,
    picture: payload?.picture,
  };

  setCookie(event, "access_token", tokens.access_token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: tokens.expiry_date ? (tokens.expiry_date - Date.now()) / 1000 : undefined,
  });

  return response;
});
