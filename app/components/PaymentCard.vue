<template>
  <div class="space-y-5">

    <UPricingPlan :title="cardState.title" :description="cardState.description" :price="priceToUSD(amount)"
      :features="products.map((prd) => prd.name)" orientation="horizontal" :tagline="cardState.tagline">
      <template #button>
        <UButton :disabled="paid" :label="cardState.paymentButtonLabel" icon="ic:outline-payments"
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

const props = defineProps<{
    data: OrderWithProductsResponse
}>()

const { publicId: orderId, amount, products, paid } = props.data
  
const cardState = reactive({
  title: "Payment",
  description: "Complete your payment to receive your order as soon as possible. After successful payment, your product will be sent to your email.",
  tagline: "Pay once, own it forever",
  paymentButtonLabel: "Continue to Payment",
  paymentButtonColor: "warning",
});

async function payment() {

  const origin = window.location.origin
  const baseUrl = !amount ? '/api/payment/free' : '/api/payment/sepay/bank'

  const urlObject = new URL(
    `${baseUrl}`,
    origin,
  );

  urlObject.searchParams.set(
    'order_id',
    orderId
  )

  urlObject.searchParams.set(
    "success_url",
    `${origin}/payment?orderId=${orderId}&status=success`
  )
  urlObject.searchParams.set(
    "error_url",
    `${origin}/payment?orderId=${orderId}&status=error`
  )

  urlObject.searchParams.set(
    "cancel_url",
    `${origin}/payment?orderId=${orderId}&status=cancel`
  )

  window.location.href = urlObject.toString()
}

onBeforeMount(() => {
  if (paid) {
    cardState.description = "The product will be delivered directly to your email shortly. Please check your inbox (and spam folder) for the download details.";
    cardState.tagline = "Payment Successful";
    cardState.paymentButtonLabel = "Paid";
    cardState.paymentButtonColor = "info";
  }
});

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
