<template>
  <div class="h-screen w-full bg-neutral-50 dark:bg-neutral-950 flex overflow-hidden">
    <ClientOnly>
      <!-- Sidebar Mobile Backdrop -->
      <div v-if="isMobileOpen" class="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 lg:hidden" @click="isMobileOpen = false" />

      <!-- Sidebar Wrapper -->
      <aside
        class="fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-all duration-300 ease-in-out"
        :class="[isCollapsed ? 'w-20' : 'w-64', isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']"
      >
        <!-- Header / Logo -->
        <div class="h-16 flex items-center justify-between px-4 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div class="flex items-center gap-3 overflow-hidden">
            <UiLogo v-if="!isCollapsed" class="size-8 shrink-0" />
            <span v-show="!isCollapsed" class="font-semibold text-lg whitespace-nowrap tracking-tight transition-opacity duration-200"> HTL Architects </span>
          </div>

          <!-- Toggle Desktop Button -->
          <UButton
            :icon="isCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
            color="neutral"
            variant="ghost"
            size="sm"
            class="hidden lg:inline-flex shrink-0"
            @click="
              () => {
                isCollapsed = !isCollapsed;
              }
            "
          />
        </div>

        <!-- Navigation Menu -->
        <div class="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
          <div v-for="(group, gIndex) in navItems" :key="gIndex">
            <div class="space-y-1">
              <NuxtLink
                v-for="item in group"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
                :class="[
                  isActive(item.to)
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 dark:bg-primary-500/15 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/60',
                  isCollapsed ? 'justify-center px-0' : '',
                ]"
                @click="isMobileOpen = false"
              >
                <UIcon :name="item.icon" class="size-5 shrink-0" />
                <span v-show="!isCollapsed" class="truncate">{{ item.label }}</span>
              </NuxtLink>
            </div>

            <USeparator v-if="gIndex < navItems.length - 1" class="my-3" />
          </div>
        </div>

        <!-- Sidebar Footer / Bottom Actions -->
        <div class="p-3 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between gap-2">
          <div v-show="!isCollapsed" class="text-xs text-neutral-400 px-2 truncate">v1.0.0</div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Navbar -->
        <header
          class="h-16 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-10"
        >
          <div class="flex items-center gap-3">
            <!-- Toggle Mobile Button -->
            <UButton
              icon="i-lucide-menu"
              color="neutral"
              variant="ghost"
              class="lg:hidden"
              @click="
                () => {
                  isMobileOpen = !isMobileOpen;
                }
              "
            />

            <!-- Dynamic Breadcrumbs -->
            <UBreadcrumb :items="breadItems" />
          </div>

          <!-- Top Right Action Controls -->
          <div class="flex items-center gap-2">
            <BtnColorMode class="hover:scale-110" />
            <UButton icon="i-lucide-bell" color="neutral" variant="ghost" size="sm" square />
          </div>
        </header>

        <!-- Dynamic Page View -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-6 bg-neutral-100/50 dark:bg-neutral-950">
          <div class="h-full w-full mx-auto">
            <NuxtPage />
          </div>
          <!-- <UCard :ui="{root: 'h-full w-full max-w-7xl mx-auto', body: 'h-full'}">
            <template #default>
              <NuxtPage />
            </template>
          </UCard> -->
        </main>
      </div>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

// Toggle states
const isCollapsed = ref(false);
const isMobileOpen = ref(false);

// Active state checker for menu items
const isActive = (path?: string) => {
  if (!path) return false;
  if (path === "/console") return route.path === "/console";
  return route.path.startsWith(path);
};

// Format Breadcrumbs intelligently
const breadItems = computed(() => {
  const segments = route.path.split("/").filter(Boolean);
  return segments.map((segment, index) => {
    const to = "/" + segments.slice(0, index + 1).join("/");
    return {
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      to,
    };
  });
});

const navItems: NavigationMenuItem[] = [
  [
    {
      label: "Overview",
      icon: "i-lucide-layout-dashboard",
      to: "/console",
    },
  ],
  [
    {
      label: "Users",
      icon: "i-lucide-users",
      to: "/console/users",
    },
    {
      label: "Categories",
      icon: "i-lucide-grid-2x2",
      to: "/console/categories",
    },
    {
      label: "Products",
      icon: "i-lucide-layers",
      to: "/console/products",
    },
    {
      label: "Orders",
      icon: "i-lucide-shopping-bag",
      to: "/console/orders",
    },
  ],
  [
    {
      label: "Back to Site",
      icon: "i-lucide-arrow-left",
      to: "/",
    },
  ],
];

useSeoMeta({
  title: "Console Dashboard",
});
</script>
