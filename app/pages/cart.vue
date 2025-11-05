<script setup lang="ts">
const { list } = useCart()

const data = await list()
</script>


<template>
  <div>
    <UButton label="Back to home" icon="ic:outline-arrow-back" color="neutral" variant="link" class="cursor-pointer"
      @click="navigateTo('/')" />
    <UPageList divide>
      <UPageCard v-for="(item, index) in data" :key="index" variant="ghost">
        <template #body>
          <div class="flex items-center gap-4">
            <UCheckbox size="xl" />
            <div class="flex gap-4">
              <div class="overflow-hidden border light:border-gray-200 dark:border-gray-700 rounded-lg max-w-22">
                <img :src="item.imageLinks[0]" class="h-22 mx-auto" />
              </div>
              <div class="flex flex-col justify-between p-1 ">
                <p class="font-bold">{{ item.name }}</p>
                <p class="text-[0.8rem] font-medium text-green-600">{{ item.plan.toUpperCase() }}</p>
                <p class="font-semibold text-orange-600 text-lg"> {{ covertMoney(item.price) }}</p>
              </div>
            </div>
          </div>
        </template>
      </UPageCard>
    </UPageList>
  </div>
</template>

<style scoped></style>