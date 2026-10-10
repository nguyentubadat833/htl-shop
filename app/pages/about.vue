<template>
  <div class="mx-auto w-full max-w-4xl py-4 sm:py-8">
    <div class="flex items-center gap-4 border-b border-default pb-6">
      <img src="/images/logo.jpg" alt="3d2ds Architecture" width="80" height="80"
        class="size-16 shrink-0 rounded-lg object-contain sm:size-20" />
      <div>
        <p class="text-xs font-medium uppercase tracking-widest text-muted">By T Architects</p>
        <h1 class="mt-1 text-2xl font-semibold sm:text-3xl">About 3d2ds</h1>
      </div>
    </div>
    <p class="mt-6 max-w-2xl text-base leading-7 text-muted">
      3d2ds is a Vietnam-based marketplace for free and premium 3D and 2D models,
      serving architects, interior designers and visualization artists worldwide.
    </p>
    <div class="mt-10 grid gap-10 md:grid-cols-[1fr_260px]">
      <div class="space-y-8">
        <section>
          <h2 class="text-lg font-semibold">Resources for your next project</h2>
          <p class="mt-3 leading-7 text-muted">
            Explore models and design resources for architecture, interiors and visualization.
            Browse by category, preview each product and choose the resources that suit your project.
          </p>
        </section>
        <section>
          <h2 class="text-lg font-semibold">How downloads work</h2>
          <dl class="mt-3 space-y-4 text-sm leading-6">
            <div>
              <dt class="font-medium">Free resources</dt>
              <dd class="text-muted">Sign in and select Download free to open the external download source. Your download is also saved to your library.</dd>
            </div>
            <div>
              <dt class="font-medium">Premium resources</dt>
              <dd class="text-muted">Complete your purchase, then download your files from your library through our storage system.</dd>
            </div>
          </dl>
        </section>
        <section>
          <h2 class="text-lg font-semibold">Before you download</h2>
          <p class="mt-3 leading-7 text-muted">
            Check the product details for file formats and compatibility.
            For questions about permitted use or a purchase, contact us before ordering.
          </p>
        </section>
        <UButton to="/" label="Explore models" trailing-icon="i-lucide-arrow-right" color="neutral" variant="outline" />
      </div>
      <aside class="self-start rounded-xl border border-default p-5" aria-label="Contact information">
        <h2 class="text-base font-semibold">Get in touch</h2>
        <p class="mt-2 text-sm leading-6 text-muted">Questions about a model or your order? Contact our team.</p>
        <ul class="mt-5 space-y-4 text-sm">
          <li class="flex items-start gap-3">
            <Icon name="i-lucide-map-pin" class="mt-0.5 size-4 shrink-0 text-muted" />
            <span>Ho Chi Minh City, Vietnam</span>
          </li>
          <li class="flex items-start gap-3">
            <Icon name="i-lucide-mail" class="mt-0.5 size-4 shrink-0 text-muted" />
            <a href="mailto:ad3d2ds@gmail.com" class="break-all hover:underline">ad3d2ds@gmail.com</a>
          </li>
          <li class="flex items-start gap-3">
            <Icon name="i-lucide-phone" class="mt-0.5 size-4 shrink-0 text-muted" />
            <a href="tel:+84971168578" class="hover:underline">+84 971 168 578</a>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "About 3d2ds",
  description: "Learn about 3d2ds, a Vietnam-based marketplace for 3D and 2D architecture and interior design models.",
});

</script>
