<template>
  <div>
    <ClientOnly>
      <UPopover v-if="userAuth !== null" :ui="popoverUI">
        <UUser :avatar="{
          src: userAuth.picture,
          icon: 'i-lucide-image',
        }" :ui="userUI" />

        <template #content>
          <UNavigationMenu v-if="userAuth" orientation="vertical" :items="items" class="data-[orientation=vertical]" />
        </template>
      </UPopover>
      <UButton v-else id="googleSigninButton" :loading="isLoading || sdkLoading" color="neutral" variant="ghost"
        icon="ic:baseline-log-in" size="md" @click="signInWithGoogle">
        <p class="hidden lg:block">Sign in</p>
      </UButton>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import session from "~/utils/session.ts";
import { type UserAuthClient, VarCookie } from "#shared/types/auth";
import type { NavigationMenuItem } from "@nuxt/ui";
import type z from "zod";
import { UserRole } from "~~/prisma/generated/browser";
import { VerifyCodeRequestSchema } from "#shared/schemas/auth";
import { useGoogleButton } from "~/composables/components/googleButton";

type VerifyCodeRequest = z.infer<typeof VerifyCodeRequestSchema>;
const userUI = {
  name: "lg:block hidden",
};
const popoverUI = {
  content: "p-2",
};

const { logout } = useAuth();
const { count: cartCount } = useCart();
const { loading: isLoading } = useGoogleButton();
const { authSession } = session();
const { googleId } = usePublicVariables();
const router = useRoute()
const googleClient = ref<any>(null);
const sdkLoading = ref(false);
const toast = useToast();
let sdkTimeout: ReturnType<typeof setTimeout> | undefined;

function sdkFailed() {
  clearTimeout(sdkTimeout);
  sdkLoading.value = false;
  document.getElementById('google-identity-sdk')?.remove();
  console.warn('[Google Sign-In] Failed to load Google Identity Services');
}

function loadGoogleSdk() {
  if (!googleId || sdkLoading.value) return;
  if ((window as any).google?.accounts?.oauth2) {
    initGoogle();
    return;
  }
  sdkLoading.value = true;
  const script = document.createElement('script');
  script.id = 'google-identity-sdk';
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.onload = () => {
    clearTimeout(sdkTimeout);
    sdkLoading.value = false;
    initGoogle();
  };
  script.onerror = sdkFailed;
  sdkTimeout = setTimeout(sdkFailed, 15000);
  document.head.appendChild(script);
}
const userAuth = ref<UserAuthClient | null>(null);

const items = computed<NavigationMenuItem[][]>(() => {
  const rs = [
    [
      {
        label: "My Orders",
        icon: "ic:baseline-shopify",
        to: '/orders'
      },
    ],
    [
      {
        label: "My Library",
        icon: "ic:baseline-layers",
        to: '/library'
      },
      {
        label: "Sign Out",
        icon: "ic:outline-log-out",
        onSelect() {
          logout().finally(() => {
            userAuth.value = null;
          });
        },
      },
    ],
  ];

  if (userAuth.value?.role === UserRole.ADMIN.toString() && !router.path.startsWith('/console')) {
    rs.unshift([
      {
        label: "CMS Admin",
        icon: "ic:baseline-admin-panel-settings",
        onSelect() {
          navigateTo('/console')
        },
      },
    ]);
  }

  return rs;
});

onMounted(() => {
  const isLogin = useCookie(VarCookie.G_LOGIN);
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
        },
      });
    }
  } else {
    authSession().remove();
  }
  loadGoogleSdk();
});

onBeforeUnmount(() => {
  clearTimeout(sdkTimeout);
  sdkLoading.value = false;
  isLoading.value = false;
  const script = document.getElementById('google-identity-sdk') as HTMLScriptElement | null;
  if (script) {
    script.onload = null;
    script.onerror = null;
    if (!googleClient.value) script.remove();
  }
});

function initGoogle() {
  if (!googleId || !(window as any).google?.accounts?.oauth2) return;
  googleClient.value = (window as any).google.accounts.oauth2.initCodeClient({
    client_id: googleId,
    scope: "openid email profile",
    ux_mode: "popup",
    error_callback: () => {
      isLoading.value = false;
    },
    callback: async (response: any) => {
      isLoading.value = true;
      try {
        if (response.error || !response.code) throw new Error('Google authorization failed');
        const user = await $fetch<UserAuthClient>("/api/auth/google/verify-code", {
          method: "POST",
          timeout: 15000,
          retry: 0,
          body: <VerifyCodeRequest>{ code: response.code },
        });
        if (!user) throw new Error('Missing user session');
        userAuth.value = user;
        authSession().set(user);
        await nextTick();
        void cartCount().catch(() => {});
      } catch {
        toast.add({
          title: 'Sign-in failed',
          description: 'Please try again.',
          icon: 'ic:baseline-log-in',
          color: 'error',
        });
      } finally {
        isLoading.value = false;
      }
    },
  });
}

function requestGoogleCode() {
  if (isLoading.value) return;
  try {
    // Keep loading for the bounded server request, not while the user uses the popup.
    googleClient.value.requestCode();
  } catch {
    isLoading.value = false;
    toast.add({ title: 'Google sign-in unavailable', description: 'Please try again.', color: 'warning' });
  }
}

function signInWithGoogle() {
  if (!googleClient.value) {
    loadGoogleSdk();
    if (googleClient.value) {
      requestGoogleCode();
      return;
    }
    toast.add({
      title: 'Google sign-in unavailable',
      description: googleId ? 'Please wait a moment and try again.' : 'Please contact support.',
      icon: 'ic:baseline-log-in',
      color: 'warning',
    });
    return;
  }
  requestGoogleCode();
}
</script>
