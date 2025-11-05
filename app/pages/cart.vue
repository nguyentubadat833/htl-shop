<script setup lang="ts">
const {list} = useCart()

const data = await list()
</script>


<template>
<div>
{{ data }}
</div>
</template>

<style scoped>

</style>