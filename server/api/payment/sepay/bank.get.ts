import { CreatePaymentSchema } from '#shared/schemas/payment'
import { SepayService } from '~~/server/core/service/sepay'

export default defineWrappedRequiredAuthHandler(async (event) => {
  console.log('tet')
  
  const { order_id, success_url, cancel_url, error_url } = zodValidateRequestOrThrow(
    CreatePaymentSchema,
    getQuery(event)
  )

  const sepayService = new SepayService()
  const { checkoutForm, checkoutURL } =
    await sepayService.createCheckoutBankTransfer(
      order_id,
      'VND',
      `DH3D2DS ${order_id}`,
      success_url,
      error_url,
      cancel_url,
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
