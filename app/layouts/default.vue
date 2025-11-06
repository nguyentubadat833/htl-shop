<template>
  <div>
    <UiHeader />
    <UMain>
      <UContainer>
        <div class="py-4 space-y-5">
          <div class="flex md:justify-start justify-center gap-1">
            <UButton v-for="item in nav" :label="item.label" :icon="item.icon" color="neutral" variant="link" @click="navigateTo(item.to)"/>
          </div>
          <!-- <UBreadcrumb :items="items">
            <template #separator>
              <span class="mx-2 text-muted">/</span>
            </template>
</UBreadcrumb> -->
          <NuxtPage />
        </div>
      </UContainer>
    </UMain>
    <UiFooter />
  </div>
</template>

<script lang="ts" setup>
import { icon } from '#build/ui/prose';
import type { BreadcrumbItem } from '@nuxt/ui'

const nav = [
  { label: 'Home', icon: 'ic:outline-house', to: '/' },
  { label: 'About', icon: 'ic:outline-info', to: '/about' },
  { label: 'Contact', icon: 'ic:outline-email', to: '/contact' }
]

const items: BreadcrumbItem[] = [
  {
    label: 'Docs',
    to: '/docs'
  },
  {
    label: 'Components',
    to: '/docs/components'
  },
  {
    label: 'Breadcrumb',
    to: '/docs/components/breadcrumb'
  }
]
</script>

<style></style>