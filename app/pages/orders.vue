<template>
    <div>
        <ClientOnly>
            <div class="space-y-6">
                <div v-for="item in items">
                    <PaymentCard :data="item"/>
                </div>
            </div>
        </ClientOnly>
    </div>
</template>
<script setup lang="ts">

const { $userApi } = useNuxtApp();
const items: OrderWithProductsResponse[] = await $userApi('/api/order/by-user')
</script>