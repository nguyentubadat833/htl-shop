<template>

    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Manage your application preferences and system maintenance.
        </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <UCard>
            <template #header>
                <div class="flex items-center gap-3">
                    <UIcon name="i-heroicons-trash" class="w-6 h-6 text-red-500" />
                    <div>
                        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                            Clean Storage
                        </h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Permanently clean data from products marked as soft deleted.
                        </p>
                    </div>
                </div>
            </template>

            <div class="text-sm text-gray-600 dark:text-gray-300">
                This action will permanently delete all products marked as soft deleted. This action cannot be undone.
            </div>

            <template #footer>
                <div class="flex justify-end">
                    <UButton color="error" variant="soft" icon="i-heroicons-sparkles" label="Clean Storage"
                        :loading="isCleaning" @click="handleCleanStorage" />
                </div>
            </template>
        </UCard>

    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'

const toast = useToast()
const isCleaning = ref(false)
const { $userApi } = useNuxtApp()

async function handleCleanStorage() {
    if (isCleaning.value) return

    isCleaning.value = true

    try {
        await $userApi('/api/product/clean')

        toast.add({
            title: 'Products Cleaned',
            description: 'Data from soft-deleted products has been successfully cleaned.',
            color: 'success',
            icon: 'i-heroicons-check-circle',
        })
    } catch (error) {
        toast.add({
            title: 'Cleaning Failed',
            description: 'An error occurred while cleaning data from soft-deleted products.',
            color: 'error',
            icon: 'i-heroicons-exclamation-circle',
        })
    } finally {
        isCleaning.value = false
    }
}
</script>