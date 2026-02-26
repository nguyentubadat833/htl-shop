<template>
  <div class="space-y-5">
    <UPricingPlan :title="cardState.title" :description="cardState.description" :price="convertMoney(amount)"
      :features="products.map(prd => prd.name)" orientation="horizontal" :tagline="cardState.tagline">
      <template #button>
        <UButton :disabled="orderIsPaid" :label="cardState.paymentButtonLabel" icon="ic:outline-payments"
          :color="(cardState.paymentButtonColor as any)" block @click="payment()" />
      </template>
    </UPricingPlan>
    <!-- <UModal v-model:open="openQRModal">
      <template #content>
        <img
          :src="`https://img.vietqr.io/image/970422-0971168578-print.png?amount=${finalAmount}&accountName=Le%20Huu%20Thien&addInfo=TT%20DH%20${orderId}`" />
      </template>
    </UModal> -->
  </div>
</template>

<script lang="ts" setup>
import z from 'zod'

// interface PricePlan {
//   products: {
//     name: string,
//     price: number
//   }[],
//   amount: number
// }

// interface PaymentInfo {
//   orderId: string,
//   orderAmount: number,
//   currency: string,
//   description: string,
//   checkoutURL: string,
//   checkoutForm: object
// }
enum Status {
  Confirm = 'confirm',
  Success = 'success',
  Error = 'error',
  Cancel = 'cancel',
}

const toast = useToast()
const route = useRoute()
const { $userApi } = useNuxtApp()
// const openQRModal = ref(false)
// const finalAmount = ref<number>()
const status = ref<Status>()
const orderId = ref<string>()
const cardState = reactive({
  title: 'Payment',
  description: 'Complete your payment to receive your order as soon as possible. After successful payment, your product will be sent to your email.',
  tagline: 'Pay once, own it forever',
  paymentButtonLabel: 'Continue to Payment',
  paymentButtonColor: 'warning'
})
const orderIsPaid = computed(() => paid || status.value === Status.Success)

const queryRaw = route.query
const parseQuery = z.object({
  status: z.enum(Status),
  orderId: z.string()
}).safeParse(queryRaw)
if (!parseQuery.success) {
  throw createError({
    statusCode: 404
  })
}

orderId.value = parseQuery.data.orderId
status.value = parseQuery.data.status

const { amount, products, paid } = await $userApi(`/api/shopping/order/${orderId.value}`)

async function payment() {
  if(!amount){
    window.location.href = `/api/payment/free?orderId=${orderId.value}&origin=${window.origin}`
    return
  }
  window.location.href = `/api/payment/sepay/bank?orderId=${orderId.value}&origin=${window.origin}`
}

onBeforeMount(() => {
  if (orderIsPaid.value) {
    cardState.description = 'The product will be delivered directly to your email shortly. Please check your inbox (and spam folder) for the download details.'
    cardState.tagline = 'Payment Successful'
    cardState.paymentButtonLabel = 'Paid'
    cardState.paymentButtonColor = 'info'
  }
})

// async function getAmountVND(){
//   const {get, convert} = changeRate()
//   const rates = await get()
//   return convert(amount, 1, rates.VND)
// }

// async function openQR(){
//   const amount = await getAmountVND()
//   finalAmount.value = Math.ceil(amount)
//   openQRModal.value = true
// }

// onBeforeRouteLeave(async () => {
//   // const confirmLeave = window.confirm("Bạn có chắc chắn muốn rời trang thanh toán không? Đơn hàng sẽ bị hủy.")
// const confirmLeave = window.confirm("Leave this page? Your order will be canceled")
//   if (confirmLeave) {
//     return true
//   }

//   return false
// })

</script>

<style></style>