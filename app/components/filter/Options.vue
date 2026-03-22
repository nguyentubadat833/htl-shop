<template>
  <UBadge label="Filters" icon="ic:outline-filter-alt" color="neutral" size="lg" class="rounded-full cursor-pointer" @click="openToogleStatus = true" />
</template>
<script setup lang="ts">
import { useFilter } from "~/composables/components/filter";

const { openToogleStatus } = useFilter();
</script>
