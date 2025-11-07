<template>
  <div class="space-y-5">
    <UPricingPlan title="Payment" description="Complete your payment to receive your order as soon as possible."
      :price="convertMoney(amount)" :features="products.map(prd => prd.name)" :button="{
        label: 'Payment now'
      }" orientation="horizontal" tagline="Pay once, own it forever">
      <template #button>
        <UButton label="Payment now" icon="ic:outline-payments" color="warning" block @click="openQR()" />
      </template>
    </UPricingPlan>
    <UModal v-model:open="openQRModal">
      <template #content>
        <img
          :src="`https://img.vietqr.io/image/970436-0051000529983-print.png?amount=${finalAmount}&account_name=Nguyen%20Tu%20Ba%20Dat&addInfo=TT%20DH_${id}`" />
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>

const { orderId: id } = useRoute().query
const { $userApi } = useNuxtApp()
const openQRModal = ref(false)
const finalAmount = ref<number>()

if (!id) {
  throw createError({
    statusCode: 404
  })
}

const { amount, products } = await $userApi(`/api/shopping/order/${id}`)

async function getAmountVND(){
  const {get, convert} = changeRate()
  const rates = await get()
  return convert(amount, 1, rates.VND)
}

async function openQR(){
  const amount = await getAmountVND()
  finalAmount.value = Math.ceil(amount)
  openQRModal.value = true
}

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