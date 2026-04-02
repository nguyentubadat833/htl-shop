<template>
  <ClientOnly @click="click()">
    <UChip v-if="quality" :text="quality" size="3xl" color="warning" inset class="hover:scale-110">
      <UButton icon="ic:outline-shopping-cart" color="neutral" variant="ghost" :size="size" />
    </UChip>
    <UButton v-else icon="ic:outline-shopping-cart" color="neutral" variant="ghost" />
  </ClientOnly>
</template>

<script lang="ts" setup>
import { useGoogleButton } from "~/composables/components/googleButton";
import session from "~/utils/session.ts";

withDefaults(
  defineProps<{
    size?: any;
  }>(),
  {
    size: undefined,
  },
);

const { click: googleButtonClick } = useGoogleButton();
const { authSession } = session();
const { count, quality } = useCart();
const getAuthSession = computed(() => !!authSession().get());

function click() {
  // if (!getAuthSession.value) {
  //   document.getElementById("googleSigninButton")?.click();
  //   return;
  // }
  googleButtonClick();
  navigateTo("/cart");
}

onBeforeMount(() => {
  count();
});
</script>

<style></style>
