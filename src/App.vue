<template>
  <header>
    <n-page-header title="Rest Optimizer" subtitle="By Nathan Seymour" />
  </header>
  <router-view />
</template>

<script lang="ts" setup>
</script>

<style lang="scss">
body, html {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}

#app {
  margin: 0;
  width: 100%;
  height: 100%;

  header {
    padding: 1em;
  }
}
</style>