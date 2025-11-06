<template>
  <div class="space-y-5">
    <UPricingPlan title="Payment" description="Complete your payment to receive your order as soon as possible."
      :price="convertMoney(amount)" :features="products.map(prd => prd.name)" :button="{
      label: 'Buy now'
    }" orientation="horizontal" tagline="Pay once, own it forever" />

  </div>
</template>

<script lang="ts" setup>

const { orderId:id } = useRoute().query
const {$userApi} = useNuxtApp()

if(!id){
  throw createError({
    statusCode: 404
  })
}

 const {amount, products} = await $userApi(`/api/shopping/order/${id}`)

</script>

<style></style>