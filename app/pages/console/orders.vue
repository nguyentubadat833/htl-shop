<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui';
import type { OrderItemResponse, OrderStatus, ProductOrderItemResponse } from '~~/shared/types/order';

interface State {
    currency: string
    orderCurrent: OrderItemResponse | undefined
}

const layout = {
    orderItems: {
        ui: {
            body: 'h-full space-y-5'
        }
    },
}

const statusColor: Record<OrderStatus, string> = {
    PENDING: 'neutral',
    PAID: 'success',
    SENDING: 'warning',
    DELIVERED: 'info',
    CANCELLED: 'error'
}

const columns = [
    {
        accessorKey: 'orderAt',
        header: "Order at"
    },
    {
        accessorKey: "publicId",
        header: "ID"
    },
    {
        accessorKey: 'status',
        header: "Status"
    },
    {
        accessorKey: 'amount',
        header: 'Total amount'
    },
    {
        accessorKey: 'orderByUser',
        header: 'Order by'
    }
] satisfies TableColumn<OrderItemResponse>[]

const orderItemsColumns = [
    {
        accessorKey: "productName",
        header: "Name"
    },
    {
        accessorKey: 'price',
        header: "Price"
    },
] satisfies TableColumn<ProductOrderItemResponse>[]

const { $userApi } = useNuxtApp()
const { data: orders, pending } = await useAsyncData(() => $userApi('/api/order/list'))
const globalFilter = ref()

const state = reactive<State>({
    currency: 'USD',
    orderCurrent: undefined
})

function onSelect(row: TableRow<OrderItemResponse>, e?: Event) {
    state.orderCurrent = row.original
}

function getStatusColor(status: OrderStatus): any {
    return statusColor[status]
}

</script>

<template>
    <div :class="[{ 'grid grid-cols-[6fr_4fr] gap-4': state.orderCurrent }]">
        <div>
            <div class="flex px-4 py-3.5 border-b border-accented">
                <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filter..." />
            </div>
            <UTable id="gridData" :loading="pending" :data="orders" :columns="columns"
                v-model:global-filter="globalFilter" @select="(row, e) => onSelect(row, e)">
                <template #status-cell="{ row }">
                    <UBadge :label="row.original.status" :color="getStatusColor(row.original.status)" />
                </template>
                <template #orderAt-cell="{ row }">
                    <NuxtTime :datetime="row.original.orderAt" year="numeric" month="numeric" day="numeric" />
                </template>
                <template #orderByUser-cell="{ row }">
                    <div class="flex flex-col">
                        <span>{{ row.original.orderByUser.name }}</span>
                        <span>{{ row.original.orderByUser.email }}</span>
                    </div>
                </template>
                <template #amount-cell="{ row }">
                    {{ row.original.amount }} {{ state.currency }}
                </template>
            </UTable>
        </div>
        <div v-if="state.orderCurrent" class="space-y-5 overflow-y-auto p-3">
            <UCard :ui="layout.orderItems.ui">
                <UFormField label="Order items">
                    <UTable :data="state.orderCurrent?.items ?? []" :columns="orderItemsColumns">
                        <template #price-cell="{ row }">
                            {{ row.original.price }} {{ state.currency }}
                        </template>
                    </UTable>
                </UFormField>
                <UFormField label="Payments">

                </UFormField>
            </UCard>
        </div>
    </div>
</template>

<style scoped></style>