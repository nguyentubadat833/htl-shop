import nodemailer from 'nodemailer'
import z from 'zod'
import { Mail } from '../core/service/mail'

export default defineNitroPlugin((nitroApp) => {
    const mailENV = useRuntimeConfig().mail

    const parse = z.safeParse(z.object({
        host: z.string(),
        port: z.string().transform(value => Number(value)),
        secure: z.string().transform(value => value === 'true'),
        auth: z.object({
            user: z.string(),
            pass: z.string()
        }),
    }), mailENV)
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
})
