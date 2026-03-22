<template>
  <div class="p-2 pl-3 bg-neutral-900 backdrop-blur border-t border-default z-50">
    <div class="parent grid grid-cols-4">
      <div class="flex justify-center">
        <BtnGoogle />
      </div>
      <div class="flex justify-center border-gray-300">
        <BtnCart size="lg" />
      </div>
      <div class="flex justify-center">
        <UColorModeButton class="hover:scale-110" />
      </div>
      <div class="flex justify-center">
        <BtnLanguage />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style></style>

<style scope>
.parent * {
  color: #d1d5db;
}
</style>
