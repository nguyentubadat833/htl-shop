<template>
  <div class="relative">
    <UiHeader />
    <UMain>
      <UContainer>
        <div class="py-5 flex flex-col gap-10">
          <div class="flex justify-center lg:justify-start">
            <UiNav />
          </div>
          <!-- <div class="flex md:justify-start justify-center gap-1">
            <UButton v-for="item in nav" :label="item.label" :icon="item.icon" color="neutral" variant="link"
              @click="navigateTo(item.to)" />
          </div> -->
          <NuxtPage />
        </div>
      </UContainer>
    </UMain>
    <UiFooter />
    <div class="fixed lg:hidden bottom-0 w-full">
      <UiStickyBar />
    </div>
    <!-- <div class="lg:hidden fixed bottom-0 w-full p-2 bg-neutral-900 backdrop-blur border-t border-default z-50">
      <div class="[&_*]:text-gray-300 grid grid-cols-3">
        <div>
          <UiGoogleButton />
        </div>
        <div class="flex justify-center border-l border-r border-gray-300">
          <UiCartButton size="lg"/>
        </div>
        <div class="flex justify-end">
          <UColorModeButton class="hover:scale-110" />
        </div>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts" setup>
// const nav = [
//   { label: 'Home', icon: 'ic:outline-house', to: '/' },
//   { label: 'Contact', icon: 'ic:outline-email', to: '/contact' }
// ]
</script>

<style></style>
