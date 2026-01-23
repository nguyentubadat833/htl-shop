import { OrderItemResponse } from "#shared/types/order";

export default defineWrappedRequiredAdminHandler(async (event) => {
  return await prisma.order.findMany({
    orderBy: {
      orderAt: 'desc',
    },
    select: {
      publicId: true,
      status: true,
      amount: true,
      orderAt: true,
      orderByUser: {
        select: {
          publicId: true,
          name: true,
          email: true
        }
      },
      items: {
        select: {
          product: {
            select: {
              alias: true,
              publicId: true,
              name: true,
              price: true
            }
          }
        }
      },
      payments: {
        select: {
          transactionId: true,
          method: true,
          amount: true,
          status: true,
          createdAt: true
        }
      }
    }
  })
    .then(data => {
      return data.map(item => {
        return <OrderItemResponse>{
          publicId: item.publicId,
          status: item.status,
          amount: item.amount,
          orderAt: item.orderAt.toString(),
          orderByUser: {
            publicId: item.orderByUser.publicId,
            name: item.orderByUser.name,
            email: item.orderByUser.email
          },
          items: item.items.map(i => {
            return {
              productAlias: i.product.alias,
              productPublicId: i.product.publicId,
              productName: i.product.name,
              price: i.product.price
            }
          }),
          payments: item.payments.map(payment => {
            return {
              transactionId: payment.transactionId,
              method: payment.method,
              amount: payment.amount,
              status: payment.status,
              createdAt: payment.createdAt.toString()
            }
          })
        }
      })
    })
});
