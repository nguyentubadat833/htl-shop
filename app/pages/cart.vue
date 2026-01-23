<script setup lang="ts">
import { ProductPlan } from '~~/prisma/generated/browser'

const { list, checkout: cartCheckout, removeProducts } = useCart()
const router = useRouter()
const data = ref<CartItemResponse[]>()
const selectedItem = ref<CartItemResponse[]>([])
const amount = ref(<number>0)

function chooseItem(value: boolean | "indeterminate", item: CartItemResponse) {
  if (value === true) {
    selectedItem.value.push(item)
    amount.value += item.product.price
  } else {
    selectedItem.value = selectedItem.value.filter(i => i.cartId !== item.cartId)
    amount.value -= item.product.price
  }
}

async function checkout() {
  const ids = selectedItem.value.map(item => item.cartId)
  const orderId = await cartCheckout(ids)
  router.push({
    path: 'payment',
    query: {
      orderId: orderId
    },
  })
}

function removeProduct(publicId: string) {
  removeProducts([publicId])
    .then(() => {
      list()
        .then(rs => {
          data.value = rs
        })
    })

}

onBeforeMount(() => {
  list()
    .then(rs => {
      data.value = rs
    })
})
</script>


<template>
  <div class="space-y-5">
    <div class="flex justify-end">
      <span v-if="!data?.length" class="italic text-gray-600 text-sm">Your cart is empty. Let’s find something you’ll love!</span>
    </div>
    <UPageList divide>
      <UPageCard v-for="(item, index) in data" :key="index" variant="ghost" :ui="{body: 'w-full'}">
        <template #body>
          <div class="flex items-center gap-4">
            <UCheckbox size="xl" @update:model-value="(value) => chooseItem(value, item)" />
            <div class="w-full flex gap-4">
              <div
                class="overflow-hidden border light:border-gray-200 dark:border-gray-700 rounded-lg min-h-20 max-h-20 min-w-20 max-w-20">
                <img :src="item.product.imageLinks[0]" class="mx-auto" />
              </div>
              <div class="flex flex-col justify-between p-1 w-full">
                <p class="font-bold lg:text-base text-[0.8rem] line-clamp-1">{{ item.product.name }}</p>
                <p class="lg:text-[0.8rem] text-[0.7rem] font-medium" :class="[{'text-green-600': item.product.plan === ProductPlan.PRO}]">{{ item.product.plan.toUpperCase()
                  }}</p>
                <div class="flex justify-between">
                  <p class="font-semibold text-orange-500 text-lg"> {{ convertMoney(item.product.price) }}</p>
                  <UButton icon="ic:baseline-delete-sweep" color="error" variant="soft"
                    @click="removeProduct(item.product.publicId)" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </UPageCard>
    </UPageList>
    <USeparator v-if="selectedItem.length" />
    <div v-if="selectedItem.length" class="flex justify-between items-center">
      <span class="text-lg font-bold">Total amount:</span>
      <div class="flex items-center justify-end gap-5">
        <span class="text-lg">{{ convertMoney(amount) }}</span>
        <UButton label="Checkout" color="warning" @click="checkout()" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>