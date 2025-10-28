import { Credentials, OAuth2Client, TokenPayload } from "google-auth-library";

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
        audience: GoogleService.CLIENT_ID,
      })
      .then((ticket) => ticket.getPayload() || null);
  }
}
