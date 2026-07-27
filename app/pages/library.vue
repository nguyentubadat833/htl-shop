<template>
    <div class="flex flex-col gap-4">
        <div v-for="item in purchasedList" :key="item.publicId"
            class="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-sm transition-shadow">

            <div class="relative group shrink-0 w-24 h-24 cursor-pointer" @click="navigateTo(`/model/${item.alias}`)">
                <img :src="item.imageLinks[0]" class="w-full h-full object-cover rounded" alt="image" />
                <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded flex items-center justify-center">
                    <span class="text-white text-xs font-semibold">Xem lại</span>
                </div>
            </div>

            <div class="flex flex-col gap-1 flex-1 min-w-0">
                <p class="font-medium text-gray-700 dark:text-gray-200 line-clamp-1 hover:underline hover:cursor-pointer w-fit"
                    @click="navigateTo(`/model/${item.alias}`)">
                    {{ item.name }}
                </p>
                <p class="text-sm text-gray-400">Đã mua ngày {{ formatPurchasedAt(item.purchasedAt) }}</p>
            </div>

            <UButton label="Download" icon="ic:round-download" color="warning" :loading="downloading[item.fileId]"
                @click="downloadFile(item.fileId)" />
        </div>

        <div v-if="purchasedList.length === 0" class="text-center text-gray-400 py-10">Bạn chưa mua sản phẩm nào.</div>
    </div>
</template>

<script setup lang="ts">
import type { ProductPurchased } from '~~/shared/types/product';

const { $userApi } = useNuxtApp()
const downloading = ref<Record<string, boolean>>({});

const purchasedList = await $fetch<ProductPurchased[]>('/api/product/purchased-by-user')

async function downloadFile(fileId: string) {
    downloading.value[fileId] = true;
    try {
        $userApi(`/api/product/file/design/${fileId}`, {
            onResponse({ response }) {
                if (response.ok) {
                    const url = response._data;
                    window.open(url, "_blank");
                }
            },
        });
    } finally {
        downloading.value[fileId] = false;
    }
}

function formatPurchasedAt(date: string) {
    return new Date(date).toLocaleDateString("en-CA");
}
</script>