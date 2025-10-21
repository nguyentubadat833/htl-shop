import { OAuth2Client } from "google-auth-library";

export default defineEventHandler(async (event) => {
  const client = new OAuth2Client();
  
  return 'Hello Nitro'
})
