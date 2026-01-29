<template>
  <div class="space-y-5">
    <UPricingPlan title="Payment" description="Complete your payment to receive your order as soon as possible."
      :price="convertMoney(amount)" :features="products.map(prd => prd.name)" :button="{
        label: 'Payment now'
      }" orientation="horizontal" tagline="Pay once, own it forever">
      <template #button>
        <UButton label="Payment now" icon="ic:outline-payments" color="warning" block @click="payment()" />
      </template>
    </UPricingPlan>
    <UModal v-model:open="openQRModal">
      <template #content>
        <img
          :src="`https://img.vietqr.io/image/970422-0971168578-print.png?amount=${finalAmount}&accountName=Le%20Huu%20Thien&addInfo=TT%20DH%20${orderId}`" />
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import z from 'zod'

interface PricePlan {
  products: {
    name: string,
    price: number
  }[],
  amount: number
}

interface PaymentInfo {
  orderId: string,
  orderAmount: number,
  currency: string,
  description: string,
  checkoutURL: string,
  checkoutForm: object
}
enum Status {
  Confirm = 'confirm',
  Success = 'success',
  Error = 'error',
  Cancel = 'cancel',
}


const route = useRoute()
const { $userApi } = useNuxtApp()
const openQRModal = ref(false)
const finalAmount = ref<number>()
const status = ref<Status>()
const orderId = ref<string>()

const queryRaw = route.query
const parseQuery = z.object({
  status: z.enum(Status),
  orderId: z.string()
}).safeParse(queryRaw)
if (!parseQuery.success) {
  console.log(parseQuery.error.issues)
  throw createError({
    statusCode: 404
  })
}

orderId.value = parseQuery.data.orderId
status.value = parseQuery.data.status

const { amount, products, paid } = await $userApi(`/api/shopping/order/${orderId.value}`)

async function payment() {
  // console.log(window.origin)
  window.location.href = `/api/payment/sepay/bank?orderId=${orderId.value}&origin=${window.origin}`
}

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