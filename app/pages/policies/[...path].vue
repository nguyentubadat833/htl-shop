<template>
  <div class="mx-auto w-full max-w-4xl py-4 sm:py-8" :lang="language">
    <!-- <nav class="mb-6 flex flex-wrap gap-2 text-sm text-muted" :aria-label="isVietnamese ? 'Điều hướng' : 'Breadcrumb'">
      <NuxtLink to="/" class="hover:underline">{{ isVietnamese ? 'Trang chủ' : 'Home' }}</NuxtLink>
      <span aria-hidden="true">/</span>
      <span>{{ content.title }}</span>
    </nav> -->
    <header class="border-b border-default pb-6">
      <!-- <p class="text-xs font-medium uppercase tracking-widest text-muted">3d2ds · HTL Architects</p> -->
      <h1 class="mt-2 text-2xl font-semibold sm:text-3xl">{{ content.title }}</h1>
      <nav class="mt-4 flex gap-4 text-sm" aria-label="Language">
        <NuxtLink :to="englishPath" lang="en" :aria-current="!isVietnamese ? 'page' : undefined"
          :class="!isVietnamese ? 'font-semibold' : 'text-muted hover:underline'">English</NuxtLink>
        <NuxtLink :to="vietnamesePath" lang="vi" :aria-current="isVietnamese ? 'page' : undefined"
          :class="isVietnamese ? 'font-semibold' : 'text-muted hover:underline'">Tiếng Việt</NuxtLink>
      </nav>
    </header>
    <article class="mt-8 space-y-8">
      <section v-for="section in content.sections" :key="section.number" :aria-labelledby="`section-${section.number}`">
        <h2 :id="`section-${section.number}`" class="text-lg font-semibold">{{ section.title }}</h2>
        <p v-for="paragraph in section.paragraphs" :key="paragraph" class="mt-3 leading-7 text-muted">{{ paragraph }}</p>
        <ul v-if="section.items.length" class="mt-3 list-disc space-y-3 pl-5 leading-7 text-muted">
          <li v-for="item in section.items" :key="item">{{ item }}</li>
        </ul>
      </section>
    </article>
    <div class="mt-10 border-t border-default pt-6">
      <h2 class="font-semibold">{{ isVietnamese ? 'Liên hệ hỗ trợ' : 'Contact support' }}</h2>
      <a href="mailto:ad3d2ds@gmail.com" class="mt-2 inline-block text-sm hover:underline">ad3d2ds@gmail.com</a>
      <nav class="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm" :aria-label="isVietnamese ? 'Các chính sách' : 'Related policies'">
        <NuxtLink v-for="item in policies" :key="item.slug" :to="`/policies/${isVietnamese ? 'vi/' : ''}${item.slug}`"
          :aria-current="item.slug === policy.slug ? 'page' : undefined" class="text-muted hover:underline">
          {{ item[language].title }}
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { policies, policyPaths } from '#shared/utils/policies';

definePageMeta({ validate: route => policyPaths.includes(route.path.replace(/\/$/, '')) });

const route = useRoute();
const config = useRuntimeConfig().public;
const segments = computed(() => Array.isArray(route.params.path) ? route.params.path : String(route.params.path ?? '').split('/'));
const language = computed<'en' | 'vi'>(() => segments.value[0] === 'vi' ? 'vi' : 'en');
const isVietnamese = computed(() => language.value === 'vi');
const policy = computed(() => {
  const parts = segments.value;
  const slug = isVietnamese.value && parts.length === 2 ? parts[1] : parts.length === 1 ? parts[0] : undefined;
  const found = policies.find(item => item.slug === slug);
  if (!found) throw createError({ statusCode: 404, statusMessage: 'Policy not found' });
  return found;
});
// Resolve the route before registering head callbacks, including on the server.
void policy.value;
const content = computed(() => policy.value[language.value]);
const englishPath = computed(() => `/policies/${policy.value.slug}`);
const vietnamesePath = computed(() => `/policies/vi/${policy.value.slug}`);
const absolute = (path: string) => new URL(path, config.siteUrl).href;

useSeoMeta({
  title: () => content.value.title,
  description: () => content.value.description,
  ogTitle: () => `${content.value.title} | 3d2ds`,
  ogDescription: () => content.value.description,
  twitterTitle: () => `${content.value.title} | 3d2ds`,
  twitterDescription: () => content.value.description,
});
useHead(() => ({
  htmlAttrs: { lang: language.value },
  link: [
    { rel: 'alternate', hreflang: 'en', href: absolute(englishPath.value) },
    { rel: 'alternate', hreflang: 'vi', href: absolute(vietnamesePath.value) },
    { rel: 'alternate', hreflang: 'x-default', href: absolute(englishPath.value) },
  ],
  script: [{
    key: 'policy-jsonld', type: 'application/ld+json',
    textContent: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'WebPage',
      name: content.value.title, description: content.value.description,
      url: absolute(isVietnamese.value ? vietnamesePath.value : englishPath.value),
      inLanguage: language.value,
    }).replace(/</g, '\\u003c'),
  }],
}));
</script>
