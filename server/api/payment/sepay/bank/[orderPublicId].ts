import { CreateSepayPaymentSchema } from '#shared/schemas/payment'
import { SepayService } from '~~/server/core/service/sepay'

export default defineWrappedRequiredAuthHandler(async (event) => {
  const { orderPublicId } = zodValidateRequestOrThrow(
    CreateSepayPaymentSchema,
    getRouterParams(event)
  )

  const sepayService = new SepayService()
  const requestURL = getRequestURL(event)
  const origin = requestURL.origin

  const { checkoutForm, checkoutURL } =
    await sepayService.createCheckoutBankTransfer(
      orderPublicId,
      'VND',
      `TT DH ${orderPublicId}`,
      `${origin}/payment?status=success`,
      `${origin}/payment?status=error`,
      `${origin}/payment?status=cancel`,
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
