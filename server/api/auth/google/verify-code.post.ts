import { OAuth2Client } from "google-auth-library";
import { VerifyCodeRequestSchema } from "#shared/schemas/auth";
import { UserAuthClient } from "#shared/types/auth";
import { GoogleService } from "~~/server/core/service/auth";

export default defineEventHandler(async (event) => {
  const { code } = zodValidateRequestOrThrow(VerifyCodeRequestSchema, await readBody(event));
  if (!code) {
    throw createError({ statusCode: 403 });
  }

  const googleService = new GoogleService();
  const {tokens, payload} = await googleService.verifyCodeWithPostmessage(code);

  if (!payload?.email) {
    throw createError({ statusCode: 403, message: "Email not found in Google payload" });
  }

  const response: UserAuthClient = {
    email: payload.email,
    name: payload?.name,
    picture: payload?.picture,  
  };

  setCookie(event, "id_token", tokens.id_token!, {
    httpOnly: true,
    secure: useRuntimeConfig(event).nodeProduction,
    maxAge: tokens.expiry_date ? (tokens.expiry_date - Date.now()) / 1000 : undefined,
  });

  return response;
});
