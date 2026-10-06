<template>
  <div class="product-gallery min-w-0 w-full max-w-full" :class="{ 'product-gallery--compact': compact }">
    <UCarousel v-if="images.length" ref="carousel" v-slot="{ item, index }" :items="images"
      :arrows="images.length > 1" :ui="carouselUI" class="min-w-0 w-full" @select="activeIndex = $event">
      <div class="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <img :src="item" :alt="`${name} — image ${index + 1}`" width="640" height="640"
          :loading="lazy || index > 0 ? 'lazy' : 'eager'" class="h-full w-full object-contain" />
      </div>
    </UCarousel>
    <div v-else class="aspect-square flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-muted">
      No preview available
    </div>
    <p v-if="compact" class="mt-2 h-4 text-center text-xs leading-4 text-muted" aria-live="polite">
      <span v-if="images.length > 1">{{ activeIndex + 1 }} / {{ images.length }}</span>
    </p>
    <div v-if="!compact && images.length > 1" ref="thumbnails"
      class="product-thumbnails mt-4 flex w-full min-w-0 gap-2 overflow-x-auto py-2" aria-label="Product previews">
      <button v-for="(image, index) in images" :key="`${image}-${index}`" type="button"
        class="size-11 shrink-0 rounded-lg transition-opacity focus-visible:outline-2 focus-visible:outline-primary"
        :class="activeIndex === index ? 'opacity-100 ring-2 ring-primary' : 'opacity-50 hover:opacity-100'"
        :aria-label="`View image ${index + 1} of ${name}`" :aria-pressed="activeIndex === index" @click="select(index)">
        <img :src="image" :alt="`${name} — thumbnail ${index + 1}`" width="44" height="44" loading="lazy"
          class="h-full w-full rounded-lg object-cover" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ images: string[]; name: string; compact?: boolean; lazy?: boolean }>();
const carousel = useTemplateRef("carousel");
const thumbnails = useTemplateRef("thumbnails");
const activeIndex = ref(0);
const carouselUI = {
  root: "min-w-0 w-full max-w-full",
  viewport: "min-w-0 overflow-hidden rounded-lg",
  item: "min-w-0 basis-full",
  prev: "start-2 sm:start-2",
  next: "end-2 sm:end-2",
};
function select(index: number) {
  carousel.value?.emblaApi?.scrollTo(index, true);
}
watch(activeIndex, async index => {
  await nextTick();
  const container = thumbnails.value;
  const button = container?.children[index] as HTMLElement | undefined;
  if (container && button) {
    const left = button.offsetLeft - container.offsetLeft;
    if (left < container.scrollLeft || left + button.offsetWidth > container.scrollLeft + container.clientWidth) {
      container.scrollTo({ left: left - (container.clientWidth - button.offsetWidth) / 2, behavior: "smooth" });
    }
  }
});
</script>
