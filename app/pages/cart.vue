<script setup lang="ts">

const { list } = useCart()
const selectedItem = ref<ProductSEOItemResponse[]>([])
const amount = ref(<number>0)

const data = await list()

function chooseItem(value: boolean | "indeterminate", item: ProductSEOItemResponse) {
  if (value === true) {
    selectedItem.value.push(item)
    amount.value += item.price
  } else {
    selectedItem.value = selectedItem.value.filter(i => i.publicId !== item.publicId)
    amount.value -= item.price
  }
}
</script>


<template>
  <div class="space-y-5">
    <UButton label="Back to home" icon="ic:outline-arrow-back" color="neutral" variant="link" class="cursor-pointer"
      @click="navigateTo('/')" />
    <UPageList divide>
      <UPageCard v-for="(item, index) in data" :key="index" variant="ghost">
        <template #body>
          <div class="flex items-center gap-4">
            <UCheckbox size="xl" @update:model-value="(value) => chooseItem(value, item)" />
            <div class="flex gap-4">
              <div class="overflow-hidden border light:border-gray-200 dark:border-gray-700 rounded-lg max-w-22">
                <img :src="item.imageLinks[0]" class="h-22 mx-auto" />
              </div>
              <div class="flex flex-col justify-between p-1 ">
                <p class="font-bold">{{ item.name }}</p>
                <p class="text-[0.8rem] font-medium text-green-600">{{ item.plan.toUpperCase() }}</p>
                <p class="font-semibold text-orange-500 text-lg"> {{ covertMoney(item.price) }}</p>
              </div>
            </div>
          </div>
        </template>
      </UPageCard>
    </UPageList>
    <USeparator />
    <div v-if="selectedItem.length" class="flex justify-between items-center">
      <span class="text-lg font-bold">Total amount:</span>
      <div class="flex items-center justify-end gap-5">
        <span class="text-lg">{{ covertMoney(amount) }}</span>
        <UButton label="Checkout" color="warning" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>