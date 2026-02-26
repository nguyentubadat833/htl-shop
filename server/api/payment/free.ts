import { OrderService } from "~~/server/core/service/order"
import { CreatePaymentSchema } from "~~/shared/schemas/payment"

export default defineEventHandler(async (event) => {
  const { orderId, origin } = zodValidateRequestOrThrow(
    CreatePaymentSchema,
    getQuery(event)
  )

  const order = await prisma.order.findUniqueOrThrow({
    where: {
      publicId: orderId
    },
    select: {
      id: true,
      publicId: true,
      amount: true,
      status: true
    }
  })

  if (order.status === 'PAID') {
    throw createError({
      statusCode: 409,
      message: 'Order is paid'
    })
  }

  if (order.amount) {
    throw createError({
      statusCode: 400
    })
  } else {
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: 'PAID',
      }
    })

    OrderService.sendProduct(order.publicId)
      .then(() => {
        prisma.order.update({
          where: {
            id: order.id
          },
          data: {
            status: 'DELIVERED'
          }
        })
      })
    return sendRedirect(event, `${origin}/payment?orderId=${orderId}&status=success`,)
  }
})
