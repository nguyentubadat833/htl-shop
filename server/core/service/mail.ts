import nodemailer from "nodemailer";
import z from "zod";

// type MailTransport = ReturnType<typeof nodemailer.createTransport>;

const runtimeConfig = useRuntimeConfig();
const mailENV = runtimeConfig.mail;

const MailEnvSchema = z.object({
  host: z.string(),
  port: z.number(),
  secure: z.boolean(),
  auth: z.object({
    user: z.string(),
    pass: z.string(),
  }),
});

const parse = MailEnvSchema.safeParse(mailENV);
if (!parse.success) {
  throw new Error("Invalid environment mail");
}
const { host, port, secure, auth } = parse.data;

const client = nodemailer.createTransport({
  host: host,
  port: port,
  secure: secure,
  auth: {
    user: auth.user,
    pass: auth.pass,
  },
});

export class Mail {
  static userAuth = auth.user;
  static client = client
  constructor() {}
}
