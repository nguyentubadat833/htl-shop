import { OAuth2Client } from "google-auth-library";

export default defineEventHandler(async (event) => {
  deleteCookie(event, VarCookie.G_ID_TOKEN)
  deleteCookie(event, VarCookie.G_LOGIN)
  return true
})
