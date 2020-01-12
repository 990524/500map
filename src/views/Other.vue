<template>
  <div class="main">
    {{ $route.params.name }}
  </div>
</template>

<script>
export default {
  name: 'Other'
}
</script>

<style scoped>
.main {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10rem;
}
</style>
