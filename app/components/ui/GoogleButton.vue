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
    <UButton v-else id="googleSigninButton" :loading="isLoading" label="Sign in" color="neutral" variant="ghost"
      icon="ic:baseline-log-in" size="md" @click="signInWithGoogle" />
  </ClientOnly>
</template>

<script setup lang="ts">
import session from "~/utils/session.ts";
import { type UserAuthClient, UserRole, VarCookie } from "#shared/types/auth";
import type { NavigationMenuItem } from "@nuxt/ui";
import type z from "zod";
import { VerifyCodeRequestSchema } from "#shared/schemas/auth";
import { useGoogleButton } from "~/composables/components/googleButton";

type VerifyCodeRequest = z.infer<typeof VerifyCodeRequestSchema>
const userUI = {
  name: "lg:block hidden"
};
const popoverUI = {
  content: "p-2"
};

const { logout } = useAuth()
const { count: cartCount } = useCart()
const { loading: isLoading } = useGoogleButton()
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
    ],
    [
      {
        label: "My cart",
        icon: "ic:outline-shopping-basket",
        to: "/cart"
      },
      {
        label: "History",
        icon: "ic:round-history",
        to: "/history"
      }
    ],
    [
      {
        label: "Logout",
        icon: "ic:outline-log-out",
        onSelect() {
          logout()
            .finally(() => {
              userAuth.value = null;
            })
          // $fetch("/api/auth/google/logout", {
          //   method: "DELETE"
          // }).finally(() => {
          //   authSession().remove();
          //   userAuth.value = null;
          //   cartQuality.value = undefined
          //   navigateTo('/')
          // });
        }
      }
    ]
  ]

  if (userAuth.value?.role === UserRole.ADMIN.toString()) {
    rs.unshift([
      {
        label: 'Console',
        icon: 'ic:baseline-admin-panel-settings',
        to: '/console'
      }
    ])
  }

  return rs
});

onBeforeMount(() => {
  const isLogin = useCookie(VarCookie.G_LOGIN)
  if (isLogin.value) {
    userAuth.value = authSession().get();
    if (!userAuth.value) {
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
  } else {
    authSession().remove()
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

      isLoading.value = true
      await $fetch("/api/auth/google/verify-code", {
        method: "POST",
        body: <VerifyCodeRequest>{
          code: response.code
        },
        async onResponse({ response }) {
          if (response.ok && response._data) {
            userAuth.value = response._data;
            authSession().set(userAuth.value!);
            await nextTick()
            cartCount()
            useRouter().push(useRoute().fullPath)
            // isLoading.value = false
          }
        }
      }).finally(() => isLoading.value = false)
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
