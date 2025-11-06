<script setup lang="ts">

const { list, checkout: cartCheckout } = useCart()
const router = useRouter()

const selectedItem = ref<CartItemResponse[]>([])
const amount = ref(<number>0)

const data = await list()

function chooseItem(value: boolean | "indeterminate", item: CartItemResponse) {
  if (value === true) {
    selectedItem.value.push(item)
    amount.value += item.product.price
  } else {
    selectedItem.value = selectedItem.value.filter(i => i.cartId !== item.cartId)
    amount.value -= item.product.price
  }
}

async function checkout(){
  const ids = selectedItem.value.map(item => item.cartId)
  const orderId = await cartCheckout(ids)
  router.push({
    path: 'payment',
    query: {
      orderId: orderId
    },
  })
}
</script>


<template>
  <div class="space-y-5">
    <UPageList divide>
      <UPageCard v-for="(item, index) in data" :key="index" variant="ghost">
        <template #body>
          <div class="flex items-center gap-4">
            <UCheckbox size="xl" @update:model-value="(value) => chooseItem(value, item)" />
            <div class="flex gap-4">
              <div class="overflow-hidden border light:border-gray-200 dark:border-gray-700 rounded-lg max-w-22">
                <img :src="item.product.imageLinks[0]" class="h-22 mx-auto" />
              </div>
              <div class="flex flex-col justify-between p-1 ">
                <p class="font-bold">{{ item.product.name }}</p>
                <p class="text-[0.8rem] font-medium text-green-600">{{ item.product.plan.toUpperCase() }}</p>
                <p class="font-semibold text-orange-500 text-lg"> {{ convertMoney(item.product.price) }}</p>
              </div>
            </div>
          </div>
        </template>
      </UPageCard>
    </UPageList>
    <USeparator v-if="selectedItem.length"  />
    <div v-if="selectedItem.length" class="flex justify-between items-center">
      <span class="text-lg font-bold">Total amount:</span>
      <div class="flex items-center justify-end gap-5">
        <span class="text-lg">{{ convertMoney(amount) }}</span>
        <UButton label="Checkout" color="warning" @click="checkout()"/>
      </div>
    </div>
  </div>
</template>

<style scoped></style>