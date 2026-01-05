import nodemailer from 'nodemailer'
import z from 'zod'
import { Mail } from '../core/service/mail'

export default defineNitroPlugin((nitroApp) => {
    const mailENV = useRuntimeConfig().mail

    const MailEnvSchema = z.object({
        host: z.string(),
        port: z.number(),
        secure: z.boolean(),
        auth: z.object({
            user: z.string(),
            pass: z.string(),
        }),
    })


    const parse = z.safeParse(MailEnvSchema, mailENV)
    if (!parse.success) {
        throw new Error("Invalid environment mail")
    }
    const { host, port, secure, auth } = parse.data

    Mail.userAuth = auth.user
    Mail.client = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: {
            user: auth.user,
            pass: auth.pass,
        },
    })
    console.log('Mail info:', Mail.client.options)
})
