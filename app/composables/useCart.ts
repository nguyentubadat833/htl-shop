import type z from "zod";
import session from "~/utils/session.ts";
import type { AddProductToCartSchema, CheckoutInCartSchema, RemoveProductsInCartSchema } from "~~/shared/schemas/cart";

const quality = ref()

export default function () {
  const { $userApi } = useNuxtApp();
  const appToast = new useAppToast();
  const { authSession } = session()

  async function count() {
    if (authSession().get()) {
      await $userApi('/api/shopping/cart/data/count', {
        onResponse({ response }) {
          if (response.ok) {
            quality.value = response._data
          }
        }
      })
    }
  }

  async function list(): Promise<ProductSEOItemResponse[]> {
    return await $userApi('/api/shopping/cart/data/list')
  }

  function addProduct(id: string) {
    if(!authSession().get()){
      document.getElementById('googleSigninButton')?.click()
      return
    }
    $userApi("/api/shopping/cart/add", {
      method: "POST",
      body: <z.infer<typeof AddProductToCartSchema>>{
        product_publicId: id,
      },
      onResponse({ response }) {
        if (response.ok) {
          count()
          appToast.success();
        }
      },
    });
  }

  function removeProducts(ids: string[]) {
    $userApi("/api/shopping/cart/remove", {
      method: "DELETE",
      body: <z.infer<typeof RemoveProductsInCartSchema>>{
        product_publicIds: ids,
      },
      onResponse({ response }) {
        if (response.ok) {
          appToast.success();
        }
      },
    });
  }

  async function checkout(ids: string[]) {
    const { orderId } = await $userApi("/api/shopping/cart/checkout", {
      method: "POST",
      body: <z.infer<typeof CheckoutInCartSchema>>{
        product_publicIds: ids,
      },
      // onResponse({ response }) {
      //   if (response.ok) {
      //     appToast.success();
      //   }
      // },
    });
    return orderId
  }

  return {
    quality,
    count,
    list,
    addProduct,
    removeProducts,
    checkout
  }
}
