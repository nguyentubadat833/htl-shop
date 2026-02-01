import { OrderWithProductsResponse } from "#shared/types/order";
import { Order } from '~~/prisma/generated/client'
import { Mail } from "~~/server/core/service/mail";
import { S3 } from "~~/server/core/service/s3";
import type { Attachment } from 'nodemailer/lib/mailer'
import type { Readable } from 'stream'

export class OrderService {
  order!: Order;
  constructor(order?: Order) {
    if (order) {
      this.order = order;
    }
  }

  async withPublicId(orderPublicId: string) {
    this.order = await prisma.order.findUniqueOrThrow({
      where: { publicId: orderPublicId },
    });
    return this;
  }

  static async getWithProducts(orderPublicId: string): Promise<OrderWithProductsResponse> {
    const data = await prisma.order.findUniqueOrThrow({
      where: { publicId: orderPublicId },
      select: {
        publicId: true,
        status: true,
        amount: true,
        items: {
          select: {
            product: {
              select: {
                alias: true,
                name: true,
                price: true
              }
            }
          }
        },
        _count: {
          select: {
            payments: {
              where: {
                status: 'SUCCESS'
              }
            }
          }
        }
      }
    })

    if (!data) {
      throw new ServerError(HttpStatus[404], 404)
    }

    const { publicId, status, amount, items, _count } = data
    return {
      publicId,
      status,
      amount,
      products: items.map(item => {
        return {
          name: item.product.name,
          price: item.product.price
        }
      }),
      paid: _count.payments > 0
    }
  }

  static async create(orderByUserId: number, cardIds: string[], currency: 'VND' | 'USD' = 'USD') {
    // const products = await Promise.all(
    //   product_publicIds.map(async (id) => {
    //     const prdService = await new ProductService().withPublicId(id);
    //     return { id: prdService.product.id, price: prdService.finalPrice };
    //   }),
    // );
    const items = await prisma.cart.findMany({
      where: {
        id: {
          in: cardIds
        },
        userId: orderByUserId
      }
    })

    return await prisma.order.create({
      data: {
        orderByUserId: orderByUserId,
        amount: items.reduce((sum, prd) => sum + prd.price, 0),
        items: {
          connect: items.map(c => ({ id: c.id }))
        },
        currency: currency
      },
      include: {
        items: true
      }
    });
  }

  static async sendProduct(orderPublicId: string) {
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

  }

  async cancel() {
    await prisma.order.update({
      where: { id: this.order.id },
      data: {
        status: "CANCELLED",
      },
    });
  }
}
