import { CreatePaymentSchema } from '#shared/schemas/payment'
import { SepayService } from '~~/server/core/service/sepay'

export default defineWrappedRequiredAuthHandler(async (event) => {
  const { orderId, origin } = zodValidateRequestOrThrow(
    CreatePaymentSchema,
    getQuery(event)
  )

  const sepayService = new SepayService()
  const { checkoutForm, checkoutURL } =
    await sepayService.createCheckoutBankTransfer(
      orderId,
      'VND',
      `DH3D2DS ${orderId}`,
      `${origin}/payment?orderId=${orderId}&status=success`,
      `${origin}/payment?orderId=${orderId}&status=error`,
      `${origin}/payment?orderId=${orderId}&status=cancel`,
    )

  const hiddenInputs = Object.entries(checkoutForm)
    .map(
      ([key, value]) =>
        `<input type="hidden" name="${key}" value="${String(value)}" />`
    )
    .join('\n')

  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Redirecting to Sepay...</title>
      </head>
      <body>
        <form id="sepay-form" action="${checkoutURL}" method="POST">
          ${hiddenInputs}
        </form>

        <script>
          document.getElementById('sepay-form').submit()
        </script>
      </body>
    </html>
  `
})
