<template>
  <div class="space-y-5">
    <!-- <UPricingPlan v-for="order in data"
      :price="convertMoney(order.amount)" :features="order.items.map(item => item.product.name)" :button="{
      label: order.status
    }" orientation="horizontal" tagline="Pay once, own it forever" /> -->
    <UPricingPlan v-for="order in data" :price="convertMoney(order.amount)"
      :features="order.items.map(i => i.product.name)">
      <template #title>
        <UBadge v-if="order.status === 'PAID'" size="lg">{{ order.status }}</UBadge>
        <UBadge v-else-if="order.status === 'CANCELLED'" color="error" variant="outline" size="lg">{{ order.status }}
        </UBadge>
        <UBadge v-else color="neutral" variant="outline" size="lg">PENDING</UBadge>
      </template>
      <!-- <template #features>
        <div>
          <div v-for="item in order.items" class="flex items-center gap-2">
            <UIcon name="ic:outline-bookmark-border"/>
            <span>{{ item.product.name }}</span>
          </div>
        </div>
      </template> -->
    </UPricingPlan>
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

function descriptionWithStatus(status: string) {

}
</script>

<style></style>