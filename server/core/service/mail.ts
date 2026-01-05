import nodemailer from 'nodemailer'

type MailTransport = ReturnType<typeof nodemailer.createTransport>
export class Mail {
    static userAuth: string
    static client: MailTransport
    constructor() { }
}