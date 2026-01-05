<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui';
import type { OrderItemResponse } from '~~/shared/types/order';

interface State {
    orderCurrent: OrderItemResponse | undefined
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

const { $userApi } = useNuxtApp()
const { data: orders, pending } = await useAsyncData(() => $userApi('/api/order/list'))

const state = reactive<State>({
    orderCurrent: undefined
})

function onSelect(row: TableRow<OrderItemResponse>, e?: Event) {
    state.orderCurrent = row.original
}


</script>

<template>
    <div>
        <UTable id="gridData" :loading="pending" :data="orders" :columns="columns"
            @select="(row, e) => onSelect(row, e)">
            <template #orderAt-cell="{row}">
                <NuxtTime :datetime="row.original.orderAt" year="numeric" month="numeric" day="numeric"/>
            </template>
            <template #orderByUser-cell="{ row }">
                <div class="flex flex-col">
                    <span>{{ row.original.orderByUser.name }}</span>
                    <span>{{ row.original.orderByUser.email }}</span>
                </div>
            </template>
        </UTable>
    </div>
</template>

<style scoped></style>