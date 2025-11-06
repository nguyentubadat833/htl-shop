<template>
  <div class="space-y-5">
     <UPricingPlan v-for="order in data"
      :price="convertMoney(order.amount)" :features="order.items.map(item => item.product.name)" :button="{
      label: order.status
    }" orientation="horizontal" tagline="Pay once, own it forever" />

  </div>
</template>

<script lang="ts" setup>
import prisma from '~~/lib/prisma';

// const prisma = usePrismaClient()

const data = await prisma.order.findMany({
  select: {
    items: {
      select: {
        product: {
          select: {
            name: true,
          }
        }
      }
    },
    amount: true,
    orderAt: true,
    status: true
  }
})

</script>

<style>

</style>