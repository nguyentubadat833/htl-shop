import { OAuth2Client } from "google-auth-library";
import { VerifyCodeRequestSchema } from "#shared/schemas/auth";
import { UserAuthClient, VarCookie } from "#shared/types/auth";
import { GoogleService } from "~~/server/core/service/auth";

export default defineEventHandler(async (event) => {
  const { code } = zodValidateRequestOrThrow(VerifyCodeRequestSchema, await readBody(event));
  if (!code) {
    throw createError({ statusCode: 403 });
  }

  const googleService = new GoogleService();
  const {tokens, payload} = await googleService.verifyCodeWithPostMessage(code);

  if (!payload?.email) {
    throw createError({ statusCode: 403, message: "Email not found in Google payload" });
  }

  const response: UserAuthClient = {
    email: payload.email,
    name: payload?.name,
    picture: payload?.picture,  
  };

  // googleService.setAuthCookie(event, tokens)

  const tokenExpiry = tokens.expiry_date ? (tokens.expiry_date - Date.now()) / 1000 : undefined
  setCookie(event, VarCookie.G_ID_TOKEN, tokens.id_token!, {
    httpOnly: true,
    secure: useRuntimeConfig(event).nodeProduction,
    maxAge: tokenExpiry,
  });

  setCookie(event, VarCookie.G_LOGIN, 'true', {
    maxAge: tokenExpiry
  })

  return response;
});
