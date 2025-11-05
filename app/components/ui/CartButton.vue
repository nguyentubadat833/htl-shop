<template>
  <ClientOnly @click="click()">
    <UChip v-if="quality" :text="quality" size="3xl" color="warning" inset>
      <UButton icon="ic:outline-shopping-basket" color="neutral" variant="ghost"/>
    </UChip>
    <UButton v-else icon="ic:outline-shopping-basket" color="neutral" variant="ghost" />
  </ClientOnly>
</template>

<script lang="ts" setup>
import session from '~/utils/session.ts'

const { authSession } = session()
const { count, quality } = useCart()

function click() {
  console.log(authSession().get())
  if(!authSession().get()){
    document.getElementById('googleSigninButton')?.click()
    return
  }
  navigateTo('/cart')
}

onBeforeMount(() => {
  count()
})
</script>

<style></style>