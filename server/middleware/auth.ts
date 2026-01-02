import { GoogleService } from "../core/service/auth";

export default defineEventHandler(async (event) => {
  function removeCookies() {
    deleteCookie(event, VarCookie.G_LOGIN);
    deleteCookie(event, VarCookie.G_ID_TOKEN);
  }
  const isLogin = getCookie(event, VarCookie.G_LOGIN) === "true";
  if (isLogin) {
    const idToken = getCookie(event, VarCookie.G_ID_TOKEN);
    if (!idToken) {
      deleteCookie(event, VarCookie.G_LOGIN);
    } else {
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
          authContext.userAuth = {
            id: user.id,
            publicId: user.publicId,
            email: user.email,
            role: user.role ?? undefined,
          };
        } else {
          removeCookies();
        }
      } else {
        removeCookies();
      }
    }
  } else {
    const path = event.path;
    if (path.startsWith("/console")) {
      await sendRedirect(event, "/", 302);
    }
  }
});
