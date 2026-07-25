<script setup lang="ts">
const { $userApi } = useNuxtApp();
const { data, pending } = await useAsyncData(() => $userApi("/api/summary"));

const stats = computed(() => {
  if (!data.value) return [];

  return [
    {
      label: "Users",
      icon: "i-lucide-users",
      total: data.value.user_total,
      subLabel: "Active",
      subValue: data.value.user_active_total,
      color: "primary",
    },
    {
      label: "Products",
      icon: "i-lucide-package",
      total: data.value.product_total,
      subLabel: "Active",
      subValue: data.value.product_active_total,
      color: "success",
    },
    {
      label: "Orders",
      icon: "i-lucide-shopping-cart",
      total: data.value.order_total,
      subLabel: "Completed",
      subValue: data.value.order_success_total,
      color: "warning",
    },
  ];
});

const topUserColumns = [
  {
    accessorKey: "name",
    header: "Customer",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "purchaseCount",
    header: "Purchases",
  },
];

const topProductColumns = [
  {
    accessorKey: "name",
    header: "Product",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "purchaseCount",
    header: "Count",
  },
];

const topCartColumns = [
  {
    accessorKey: "name",
    header: "Product",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "addToCartCount",
    header: "Added",
  },
];

const revenueColumns = [
  {
    accessorKey: "period",
    header: "Period",
  },
  {
    accessorKey: "total_orders",
    header: "Orders",
  },
  {
    accessorKey: "total_customers",
    header: "Customers",
  },
  {
    accessorKey: "total_products",
    header: "Products",
  },
  {
    accessorKey: "total_revenue",
    header: "Revenue",
  },
];

</script>

<template>
  <div class="py-5 h-full flex flex-col overflow-hidden">
    <div v-if="pending" class="flex justify-center py-24">
      <UIcon name="i-lucide-loader-circle" class="size-10 animate-spin" />
    </div>

    <div v-else class="space-y-6 overflow-y-auto p-2">

      <div class="grid gap-4 md:grid-cols-3">
        <UCard v-for="item in stats" :key="item.label">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-muted">
                {{ item.label }}
              </div>

              <div class="mt-2 text-4xl font-bold">
                {{ item.total }}
              </div>

              <UBadge :color="(item.color as any)" variant="soft" class="mt-3">
                {{ item.subLabel }} {{ item.subValue }}
              </UBadge>
            </div>

            <div class="rounded-xl bg-muted p-4">
              <UIcon :name="item.icon" class="size-8" />
            </div>
          </div>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div class="font-semibold">
            Revenue
          </div>
        </template>

        <UTable :columns="revenueColumns" :data="data?.revenue_by_month">
          <template #period-cell="{ row }">
            {{ String(row.original.month).padStart(2, "0") }}/{{ row.original.year }}
          </template>
          <template #total_revenue-cell="{ row }">
            {{
              priceToUSD(row.original.total_revenue)
            }}
          </template>
        </UTable>
      </UCard>

      <!-- Tables -->

      <div class="grid gap-6 xl:grid-cols-2">
        <UCard>
          <template #header>
            <div class="font-semibold">
              Top Customers
            </div>
          </template>

          <UTable :columns="topUserColumns" :data="data?.top_users" sticky class="flex-1 max-h-96 min-h-44">
            <template #name-cell="{ row }">
              <div class="flex items-center gap-3">
                <UAvatar :src="row.original.image ?? undefined" :alt="row.original.name" />

                <span>{{ row.original.name }}</span>
              </div>
            </template>
          </UTable>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-semibold">
              Top Purchased Products
            </div>
          </template>

          <UTable :columns="topProductColumns" :data="data?.top_paid_products" sticky class="flex-1 max-h-96 min-h-44">
            <template #price-cell="{ row }">
              {{ row.original.price }}
              {{ row.original.currency }}
            </template>
          </UTable>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div class="font-semibold">
            Most Added To Cart
          </div>
        </template>

        <UTable :columns="topCartColumns" :data="data?.top_add_cart_products" sticky class="flex-1 max-h-96 min-h-44">
          <template #price-cell="{ row }">
            {{ row.original.price }}
            {{ row.original.currency }}
          </template>
        </UTable>
      </UCard>
    </div>
  </div>
</template>