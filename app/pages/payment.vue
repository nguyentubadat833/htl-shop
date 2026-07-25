<template>
    <div>
        <ClientOnly>
            <PaymentCard :data="data" mode="payment" />
        </ClientOnly>
    </div>
</template>
<script setup lang="ts">
import z from 'zod';

const route = useRoute();
const { $userApi } = useNuxtApp();

const queryRaw = route.query;
const parseQuery = z
    .object({
        status: z.enum(['success', 'cancel', 'error', 'confirm']).optional(),
        orderId: z.string(),
    })
    .safeParse(queryRaw);
if (!parseQuery.success) {
    throw createError({
        statusCode: 404,
    });
}

const orderIdQuery = parseQuery.data.orderId;
const statusQuery = parseQuery.data.status

const data = await $userApi(`/api/shopping/order/${orderIdQuery}`)
    .then(rs => {
        if (statusQuery !== 'success') {
            return rs
        } else {
            return {
                ...rs,
                paid: rs.paid || true
            }
        }
    })
</script>