<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const errorMessages: Record<number, { title: string; description: string }> = {
  404: {
    title: 'Page not found',
    description: 'The page you are looking for does not exist or has been moved.',
  },
  403: {
    title: 'Access denied',
    description: 'You do not have permission to view this content.',
  },
  500: {
    title: 'Server error',
    description: 'Something went wrong on our end. Please try again later.',
  },
}

const info = computed(() => {
  return (
    errorMessages[props.error.statusCode] ?? {
      title: 'Something went wrong',
      description: props.error.message || 'Sorry for the inconvenience.',
    }
  )
})

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="flex flex-col items-center text-center gap-6 max-w-md">
      <span class="text-8xl font-bold text-(--ui-primary)">
        {{ error.statusCode }}
      </span>

      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ info.title }}
        </h1>
        <!-- <p class="text-gray-500 dark:text-gray-400">
          {{ info.description }}
        </p> -->
      </div>

      <div class="flex items-center gap-3">
        <UButton
          label="Back to home"
          icon="ic:round-home"
          color="warning"
          size="lg"
          @click="handleError"
        />
        <UButton
          label="Go back"
          icon="ic:round-arrow-back"
          color="neutral"
          variant="soft"
          size="lg"
          @click="$router.back()"
        />
      </div>
    </div>
  </div>
</template>