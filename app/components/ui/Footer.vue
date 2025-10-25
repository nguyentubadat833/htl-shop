<template>
  <UFooter :ui="footerUI">
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns">
          <template #right>
            <UFormField name="email" label="Subscribe to our newsletter" size="lg">
              <UInput type="email" class="w-full">
                <template #trailing>
                  <UButton type="submit" size="xs" color="neutral" label="Subscribe" />
                </template>
              </UInput>
            </UFormField>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>
  </UFooter>
</template>

<script lang="ts" setup>
import type { FooterColumn } from '@nuxt/ui'

const footerUI = {
  root: 'bg-gray-100'
}

const columns: FooterColumn[] = [
  {
    label: 'About Us',
    children: [
      { label: 'About 2D3DS', },
      { label: 'Our Team', },
      { label: 'Contact', },
      { label: "Careers" },
      { label: "Blog / News" }
    ]
  },
  {
    label: 'Solutions',
    children: [
      { label: 'Tutorials', },
      { label: 'Video Courses', },
      { label: 'Blog Articles', },
      { label: 'Free Design Samples', },
      { label: 'Join our Community', },
    ]
  },
  {
    label: "Support",
    children: [
      {label: "How to Order"},
      {label: "Payment Methods"},
      {label: "Refund Policy"}, 
      {label: "Privacy Policy"},
      {label: "Terms of Service"},
      {label: "FAQ"}
    ]
  },
  {
    label: "Follow Us",
    children: [
      {label: "Facebook"},
      {label: "Instagram"},
      {label: "YouTube"},
      {label: "Behance"},
      {label: "Pinterest"}
    ]
  }
]
</script>

<style></style>