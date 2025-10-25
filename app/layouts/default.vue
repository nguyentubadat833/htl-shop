<template>
  <div>
    <UiHeader />
    <UMain>
      <UContainer>
        <div class="py-4">
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
import type { BreadcrumbItem } from '@nuxt/ui'

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