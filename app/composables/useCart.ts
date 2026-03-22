import type z from "zod";
import session from "~/utils/session.ts";
import type { AddProductToCartSchema, CheckoutInCartSchema, RemoveProductsInCartSchema } from "#shared/schemas/cart";

const quality = ref();

export default function () {
  const router = useRouter();
  const appToast = new useAppToast();
  const { authSession } = session();
  const { $userApi } = useNuxtApp();

  async function count() {
    if (authSession().get()) {
      await $userApi("/api/shopping/cart/data/count", {
        onResponse({ response }) {
          if (response.ok) {
            quality.value = response._data;
          }
        },
      });
    }
  }

  async function list() {
    return await $userApi("/api/shopping/cart/data/list");
  }

  async function addProduct(id: string, name?: string, isToast = true) {
    if (!authSession().get()) {
      document.getElementById("googleSigninButton")?.click();
      return;
    }
    const { id: cartdId } = await $userApi("/api/shopping/cart/add", {
      method: "POST",
      body: <z.infer<typeof AddProductToCartSchema>>{
        product_publicId: id,
      },
      onResponse({ response }) {
        if (response.ok) {
          count();
          if (isToast) {
            appToast.success({
              title: 'Added to cart',
              description: name
            });
          }
        }
      },
    });
    return cartdId
  }

  async function removeProducts(ids: string[]) {
    await $userApi("/api/shopping/cart/remove", {
      method: "DELETE",
      body: <z.infer<typeof RemoveProductsInCartSchema>>{
        product_publicIds: ids,
      },
      onResponse({ response }) {
        if (response.ok) {
          count()
          appToast.success();
        }
      },
    });
  }

  async function checkout(ids: string[]) {
    const { orderId } = await $userApi("/api/shopping/cart/checkout", {
      method: "POST",
      body: <z.infer<typeof CheckoutInCartSchema>>{
        cardIds: ids,
      },
      onResponse({ response }) {
        if (response.ok) {
          navigateTo(`/payment?orderId=${response._data}`);
          count();
        }
      },
    });
    return orderId;
  }

  async function buyNow(publicId: string) {
    try {
      const cardId = await addProduct(publicId, undefined, false)
      if (cardId) {
        const orderId = await checkout([cardId]);
        await router.push({
          path: "payment",
          query: {
            orderId: orderId,
            status: "confirm",
          },
        });
      }
    } catch (err) {
      appToast.toast.add({
        title: 'Error',
        color: 'error'
      })
    }
  }

  return {
    quality,
    count,
    list,
    addProduct,
    removeProducts,
    checkout,
    buyNow
  };
}
