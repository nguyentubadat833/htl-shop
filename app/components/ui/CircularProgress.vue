<script setup lang="ts">
const props = defineProps<{
  value: number; // 0–100
  size?: number; // đường kính pixel, default 100
  stroke?: number; // độ dày stroke
  color?: string; // màu Tailwind, ví dụ 'text-blue-500'
}>()

const size = computed(() => props.size ?? 100)
const stroke = computed(() => props.stroke ?? 4)
const radius = computed(() => 16) // bán kính circle trong viewBox
const dashArray = 100
const dashOffset = computed(() => 100 - Math.min(100, Math.max(0, props.value)))
const color = computed(() => props.color ?? 'text-indigo-500')
</script>

<template>
  <div
    class="relative flex items-center justify-center"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg
      viewBox="0 0 36 36"
      class="w-full h-full"
      aria-hidden="false"
      role="img"
    >
      <!-- background -->
      <path
        class="text-gray-200"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="currentColor"
        :stroke-width="stroke"
      />

      <!-- progress -->
      <path
        :class="[color, 'transition-all duration-500']"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="currentColor"
        :stroke-width="stroke"
        stroke-dasharray="100"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        transform="rotate(-90 18 18)"
      />
    </svg>

    <!-- center label -->
    <div class="absolute text-sm font-medium text-gray-700 select-none">
      {{ Math.round(props.value) }}%
    </div>
  </div>
</template>
