import { OAuth2Client } from "google-auth-library";
import { zodValidateRequestOrThrow } from "~~/server/utils/validate-request";
import {GoogleVerifyTokenRequestSchema} from '#shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const {credential} = zodValidateRequestOrThrow(GoogleVerifyTokenRequestSchema, await readBody(event))
  const client = new OAuth2Client();
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: useRuntimeConfig(event).public.googleClientId
    });
    const payload = ticket.getPayload();
    console.log(ticket)
    // This ID is unique to each Google Account, making it suitable for use as a primary key
    // during account lookup. Email is not a good choice because it can be changed by the user.
    const userId = payload?.sub
    const email = payload?.email
    if(userId && email){
      
      return {email}
    }
  } catch (e) {
    console.error(e)
  }
  throw createError({
      statusCode: 401
    })
});
