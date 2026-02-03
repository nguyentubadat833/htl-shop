<template>
  <div>
    <UiHeader />
    <UMain>
      <UContainer>
        <div class="py-4 space-y-5">
          <div class="flex md:justify-start justify-center gap-1">
            <UButton v-for="item in nav" :label="item.label" :icon="item.icon" color="neutral" variant="link"
              @click="navigateTo(item.to)" />
          </div>
          <NuxtPage />
        </div>
      </UContainer>
    </UMain>
    <UiFooter />
  </div>
</template>

<script lang="ts" setup>
const nav = [
  { label: 'Home', icon: 'ic:outline-house', to: '/' },
  { label: 'Contact', icon: 'ic:outline-email', to: '/contact' }
]
</script>

<style></style>