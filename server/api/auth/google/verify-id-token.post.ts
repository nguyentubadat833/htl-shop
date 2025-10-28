import { GoogleService } from "~~/server/core/service/auth";
import { UserAuthClient } from "~~/shared/types/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  const idToken = body?.['credential'] || getCookie(event, VarCookie.G_ID_TOKEN);
  if (!idToken || typeof idToken !== "string") {
    throw createError({
      statusCode: 401,
    });
  }

  const googleService = new GoogleService();
  const payload = await googleService.verifyIdToken(idToken);

  if (!payload?.email) {
    throw createError({
      statusCode: 401,
    });
  }

  return <UserAuthClient>{
    email: payload.email,
    name: payload?.name,
    picture: payload?.picture,
  };
});
