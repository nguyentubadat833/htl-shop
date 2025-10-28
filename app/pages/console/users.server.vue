<script setup lang="ts">
const prisma = usePrismaClient()
const users = await prisma.user.findMany({
  select: {
    publicId: true,
    provider: true,
    email: true,
    name: true,
    status: true,
    image: true,
    createdAt: true
  }
})
</script>

<template>
<div>
  <UTable :data="users" />
</div>
</template>

<style scoped>

</style>