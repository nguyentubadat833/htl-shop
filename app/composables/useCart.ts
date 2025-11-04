import type z from "zod";
import type { AddProductToCartSchema, CheckoutInCartSchema, RemoveProductsInCartSchema } from "~~/shared/schemas/cart";

export default function () {
  const { $userApi } = useNuxtApp();
  const appToast = new useAppToast();

  function addProduct(id: string) {
    $userApi("/api/shopping/cart/add", {
      method: "POST",
      body: <z.infer<typeof AddProductToCartSchema>>{
        product_publicId: id,
      },
      onResponse({ response }) {
        if (response.ok) {
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
    const {orderId} = await $userApi("/api/shopping/cart/checkout", {
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
    addProduct,
    removeProducts,
    checkout
  }
}
