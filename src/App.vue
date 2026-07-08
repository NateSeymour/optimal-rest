<template>
  <header>
    <n-page-header title="Optimal Rest" subtitle="By Nathan Seymour" @back="() => router.push('/')">
      <template #back>
        <n-icon v-if="canGoBack">
          <ArrowLeft />
        </n-icon>
      </template>

      <template #extra>
        <n-icon @click="showMenu = !showMenu">
          <Bars />
        </n-icon>
      </template>
    </n-page-header>
  </header>

  <router-view />

  <n-drawer v-model:show="showMenu" :placement="'right'" width="75%">
    <n-drawer-content title="Saved Sequences">
      <div class="saved-sequences">
        <n-button
          v-for="sequence in sequences"
          class="sequence"
          type="primary"
          @click="() => { router.push(`/sequence/${sequence}`); showMenu = false; }"
        >
          Sequence {{sequence}}
        </n-button>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<script lang="ts" setup>
import {computed, ref} from "vue";
import {useRouter} from "vue-router";
import { ArrowLeft, Bars } from "@vicons/fa";

const router = useRouter();

const showMenu = ref(false);

const canGoBack = computed(() => {
  return router.currentRoute.value.fullPath !== '/';
});

const sequences = Object.keys(localStorage)
    .filter(key => key.startsWith('sequence-'))
    .map(sequence => sequence.replace('sequence-', ''))
    .map(Number);
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

.saved-sequences {
  display: flex;
  flex-direction: column;
  gap: 0.5em;

  .sequence {
    width: 100%;
  }
}
</style>