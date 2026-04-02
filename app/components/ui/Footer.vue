<template>
  <UFooter :ui="footerUI">
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns">
          <template #right>
            <!-- <UFormField name="email" label="Subscribe to our newsletter" size="lg">
              <UInput type="email" class="w-full">
                <template #trailing>
                  <UButton type="submit" size="xs" color="neutral" label="Subscribe" />
                </template>
              </UInput>
            </UFormField> -->
            <!-- <UFormField name="email" label="Subscribe to get the latest updates" size="lg">
              <UInput type="email" class="w-full" placeholder="We are committed to not spamming you">
                <template #trailing>
                  <UButton type="submit" size="xs" color="neutral" label="Subscribe" />
                </template>
              </UInput>
            </UFormField> -->
            <div class="flex flex-col gap-4">
              <div class="text-sm font-semibold">Subscribe to get the latest updates</div>
              <div>
                <UButton
                  type="submit"
                  size="xs"
                  color="neutral"
                  :label="authSession().get() ? 'You are already registered' : 'Subscribe'"
                  @click="googleButtonClick"
                  class="xl:w-full w-56 flex justify-center"
                />
              </div>
            </div>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>
  </UFooter>
</template>

<script lang="ts" setup>
import type { FooterColumn } from "@nuxt/ui";
import { useGoogleButton } from "~/composables/components/googleButton";
import session from "~/utils/session.ts";

const footerUI = {
  root: "light:bg-gray-100 dark:border-t  dark:border-gray-800",
};

const columns: FooterColumn[] = [
  {
    label: "About Us",
    children: [{ label: "About 2D3DS" }, { label: "Our Team" }, { label: "Contact" }, { label: "Careers" }, { label: "Blog / News" }],
  },
  {
    label: "Solutions",
    children: [{ label: "Tutorials" }, { label: "Video Courses" }, { label: "Blog Articles" }, { label: "Free Design Samples" }, { label: "Join our Community" }],
  },
  {
    label: "Support",
    children: [
      { label: "How to Order" },
      { label: "Payment Methods" },
      { label: "Refund Policy" },
      { label: "Privacy Policy" },
      { label: "Terms of Service" },
      { label: "FAQ" },
    ],
  },
  {
    label: "Follow Us",
    children: [{ label: "Facebook" }, { label: "Instagram" }, { label: "YouTube" }, { label: "Behance" }, { label: "Pinterest" }],
  },
];

const { authSession } = session();
const { click: googleButtonClick } = useGoogleButton();
</script>

<style></style>
