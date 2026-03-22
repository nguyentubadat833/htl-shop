<template>
  <div>
    <UBadge label="Clear filters" icon="ic:outline-filter-alt-off" color="neutral" variant="soft" size="lg" class="rounded-full cursor-pointer" @click="resetFilter" />
  </div>
</template>
<script setup lang="ts">
import { useFilter } from "~/composables/components/filter";

const { resetFilter } = useFilter();
</script>
