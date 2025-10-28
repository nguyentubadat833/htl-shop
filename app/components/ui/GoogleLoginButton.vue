<template>
  <ClientOnly>

    <UPopover v-if="userAuth" :ui="popoverUI">
      <UUser :avatar="{
            src: userAuth?.picture ?? '',
            icon: 'i-lucide-image'
        }" :ui="userUI" />

      <template #content>
        <UNavigationMenu v-if="userAuth" orientation="vertical" :items="items" class="data-[orientation=vertical]" />
      </template>
    </UPopover>
    <UButton v-else label="Sign in" color="neutral" variant="ghost" icon="ic:baseline-log-in" size="md"
             @click="signInWithGoogle" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { VerifyCodeRequestSchema } from "#shared/schemas/auth";
import type z from "zod";
import { type UserAuthClient, VarCookie } from "#shared/types/auth";
import session from "~/utils/session.ts";
import type { NavigationMenuItem } from "@nuxt/ui";

type VerifyCodeRequest = z.infer<typeof VerifyCodeRequestSchema>
const userUI = {
  name: "lg:block hidden"
};
const popoverUI = {
  content: "p-2"
};
const { authSession } = session();
const { googleId } = usePublicVariables();
const googleClient = ref<any>(null);
const userAuth = ref<UserAuthClient | null>(null);

const items = computed<NavigationMenuItem[][]>(() => {
  const rs = [
    [
      {
        label: userAuth.value?.name ?? "",
        icon: "ic:outline-account-circle",
        to: "/profile"
      },
      {
        label: "Shopping",
        icon: "ic:outline-shopping-basket",
        to: "/cart"
      }
    ],
    [
      {
        label: "Logout",
        icon: "ic:outline-log-out",
        onSelect() {
          $fetch("/api/auth/google/logout", {
            method: "DELETE"
          }).finally(() => {
            authSession().remove();
            userAuth.value = null;
          });
        }
      }
    ]
  ]

  if (userAuth.value?.role === "ADMIN"){

  }

  return rs
});

onBeforeMount(() => {
  userAuth.value = authSession().get();
  if (!userAuth.value) {
    const googleIdTokenCookie = useCookie(VarCookie.G_LOGIN);
    $fetch("/api/auth/google/verify-id-token", {
      method: "POST",
      credentials: "include",
      onResponse({ response }) {
        if (response.ok && response._data) {
          userAuth.value = response._data;
          authSession().set(userAuth.value!);
        }
      }
    });
  }
});
onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = initGoogle;
  document.head.appendChild(script);
});

function initGoogle() {
  googleClient.value = (window as any).google.accounts.oauth2.initCodeClient({
    client_id: googleId,
    scope: "openid email profile",
    ux_mode: "popup",
    callback: async (response: any) => {
      // console.log('Google OAuth Response:', response)

      await $fetch("/api/auth/google/verify-code", {
        method: "POST",
        body: <VerifyCodeRequest>{
          code: response.code
        },
        onResponse({ response }) {
          if (response.ok && response._data) {
            userAuth.value = response._data;
            authSession().set(userAuth.value!);
          }
        }
      });
    }
  });
}

function signInWithGoogle() {
  if (!googleClient.value) {
    console.warn("Google chưa sẵn sàng");
    return;
  }
  googleClient.value.requestCode();
}
</script>
