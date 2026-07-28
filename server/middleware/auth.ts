import { UserRole } from "~~/prisma/generated/enums";
import { GoogleService } from "../core/service/auth";
import { UserAuth, UserAuthContext } from "../utils/context-working";

function getCookieFromHeader(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return;

  return cookieHeader
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export default defineEventHandler(async (event) => {
  function removeCookies() {
    deleteCookie(event, VarCookie.G_LOGIN);
    deleteCookie(event, VarCookie.G_ID_TOKEN);
  }

  const currentPath = getRequestURL(event).pathname;
  if (currentPath.startsWith("/api/_")) {
    return;
  }

  const isLogin = getCookie(event, VarCookie.G_LOGIN) === "true";
  const idToken = getCookie(event, VarCookie.G_ID_TOKEN);

  if (!idToken || !isLogin) {
    removeCookies();
    return;
  }

  try {
    const googleService = new GoogleService();
    const tokenPayload = await googleService.verifyIdToken(idToken);
    if (tokenPayload) {
      const user = await prisma.user.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "GOOGLE",
            providerAccountId: tokenPayload.sub,
          },
        },
        select: {
          id: true,
          publicId: true,
          role: true,
          email: true,
        },
      });
      if (user) {
        const authContext = new UserAuthContext(event);

        const userAUth = {
          id: user.id,
          publicId: user.publicId,
          email: user.email,
          role: user.role ?? undefined,
        } satisfies UserAuth;

        authContext.userAuth = userAUth;
      }
    }
  } catch {
    removeCookies();
  }

  const user = UserAuthContext.unwrapUserAuthContext(event);

  if (currentPath.startsWith("/console")) {
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Required auth",
      });
    }

    if (user.role !== UserRole.ADMIN) {
      throw createError({
        statusCode: 403,
        statusMessage: "Required role",
      });
    }
  }
});
