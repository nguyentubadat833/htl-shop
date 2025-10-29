<script setup lang="ts">

const products = ref<ProductItemResponse[]>([])
onBeforeMount(() => {
  $fetch('/api/product/list', {
    onResponse({ response }) {
      if (response.ok) {
        products.value = response._data
      }
    }
  })
})
</script>

<template>
  <div>
    products

  </div>
</template>

<style scoped></style>