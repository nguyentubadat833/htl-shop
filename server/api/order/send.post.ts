import z from "zod";
import { Mail } from "~~/server/core/service/mail";
import { S3 } from "~~/server/core/service/s3";
import type { Attachment } from 'nodemailer/lib/mailer'
import type { Readable } from 'stream'

const Schema = z.object({
  orderPublicId: z.string()
})

export default defineWrappedRequiredAdminHandler(async (event) => {
  const { orderPublicId } = zodValidateRequestOrThrow(Schema, await readBody(event))

  const order = await prisma.order.findUniqueOrThrow({
    where: {
      publicId: orderPublicId,
    },
    select: {
      status: true,
      orderByUser: {
        select: {
          name: true,
          email: true
        }
      },
      items: {
        select: {
          product: {
            select: {
              name: true,
              files: {
                where: {
                  type: 'DESIGN'
                },
                select: {
                  type: true,
                  objectName: true,
                  bucket: true
                },
                take: 1
              }
            }
          }
        }
      }
    }
  })

  if (
    order.items.find(item => !item.product.files.length)
  ) {
    throw new ServerError("Missing design file", 409, 'logic')
  }

  const productListText = order.items
    .map((item, index) => `${index + 1}. ${item.product.name}`)
    .join('\n')

  const textMail = `
Dear ${order.orderByUser.name ?? 'Customer'},

Thank you for trusting and purchasing from HTL Architects.

Below is the list of products you have purchased:
${productListText}

Please find the attached files related to your order.
If you have any questions or need further assistance, feel free to contact us.

Best regards,
HTL Architects
`

  const attachments: Attachment[] = []

  for (const item of order.items) {
    const file = item.product.files[0]
    if (!file) continue

    const stream: Readable = await S3.CLIENT.getObject(
      file.bucket,
      file.objectName
    )

    stream.on('error', (err) => {
      console.error('[MINIO STREAM ERROR]', err)
    })

    attachments.push({
      filename: file.objectName,
      content: stream,
      contentType: 'application/octet-stream'
    })
  }

  await Mail.client.sendMail({
    from: `"HTL Architects" <${Mail.userAuth}>`,
    to: order.orderByUser.email,
    subject: 'Thank you for your purchase at HTL Architects',
    text: textMail,
    attachments: attachments,
  })

  await prisma.order.update({
    where: {
      publicId: orderPublicId
    },
    data: {
      status: 'DELIVERED'
    }
  })

  setResponseStatus(event, 204)
  return 'ok'
});
