import { SePayPgClient } from 'sepay-pg-node';
import z from 'zod';
import { OrderService } from './order';
import { changeRate } from './money';

const { sepay: sepayConfig } = useRuntimeConfig()

let client: SePayPgClient | null = null

const getClient = () => {
    console.log('get sepay client')
    const parse = z.object({
        env: z.enum(["sandbox", "production"]),
        id: z.string(),
        key: z.string()
    }).safeParse(sepayConfig)
    if (!parse.success) {
        throw new Error('Invalid sepay env', {
            cause: parse.error.issues
        })
    }
    const sepay = parse.data

    client = new SePayPgClient({
        env: sepay.env,
        merchant_id: sepay.id,
        secret_key: sepay.key
    });

    return client
}

async function getAmountVND(amount: number) {
    const { get, convert } = changeRate()
    const rates = (await get()).rates
    return convert(amount, 1, rates.VND)
}


export class SepayService {

    private get client() {
        return client ?? getClient()
    }

    async createCheckoutBankTransfer(
        orderPublicIdId: string,
        currency: string,
        description: string,
        successURL: string,
        errorURL: string,
        cancelURL: string
    ) {

        const order = await prisma.order.findUniqueOrThrow({
            where: {
                publicId: orderPublicIdId
            },
            select: {
                amount: true
            }
        })
        const amount = await getAmountVND(order.amount).then(Math.ceil)

        const checkoutURL = this.client.checkout.initCheckoutUrl();
        const checkoutForm = this.client.checkout.initOneTimePaymentFields({
            operation: 'PURCHASE',
            payment_method: 'BANK_TRANSFER',
            order_invoice_number: orderPublicIdId,
            order_amount: amount,
            currency: currency,
            order_description: description,
            success_url: successURL,
            cancel_url: cancelURL,
            error_url: errorURL
        });
        return {
            checkoutURL,
            checkoutForm
        }
    }
}