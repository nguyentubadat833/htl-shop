import { Credentials, OAuth2Client, TokenPayload } from "google-auth-library";
import { VarCookie } from "#shared/types/auth";
import type { EventHandlerRequest, H3Event } from "h3";

type VerifyCodeWithPostmessage = {
  tokens: Credentials;
  payload: TokenPayload;
};
export class GoogleService {
  static CLIENT_ID: string;
  static SECRET_ID: string;
  constructor() {}

  async verifyCodeWithPostMessage(code: string): Promise<VerifyCodeWithPostmessage> {
    const client = new OAuth2Client(GoogleService.CLIENT_ID, GoogleService.SECRET_ID, "postmessage");
    const { tokens } = await client.getToken(code);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GoogleService.CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      throw createError({ statusCode: 401, message: "Invalid Token Payload" });
    }

    return { tokens, payload };
  }

  async verifyIdToken(idToken: string): Promise<TokenPayload | null> {
    const client = new OAuth2Client();
    return client
      .verifyIdToken({
        idToken,
        audience: GoogleService.CLIENT_ID
      })
      .then((ticket) => ticket.getPayload() || null);
  }

  // setAuthCookie(event: H3Event<EventHandlerRequest>, tokens: Credentials){
  //   const tokenExpiry = tokens.expiry_date ? (tokens.expiry_date - Date.now()) / 1000 : undefined
  //   setCookie(event, VarCookie.G_ID_TOKEN, tokens.id_token!, {
  //     httpOnly: true,
  //     secure: useRuntimeConfig(event).nodeProduction,
  //     maxAge: tokenExpiry,
  //   });
  //
  //   setCookie(event, VarCookie.G_LOGIN, 'true', {
  //     maxAge: tokenExpiry
  //   })
  // }
}
