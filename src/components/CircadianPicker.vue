<template>
  <n-slider
      :class="reversed ? 'circadian-picker-slider-reversed' : 'circadian-picker-slider'"
      v-model:value="sleep"
      range
      :step="1"
      :min="0"
      :max="24"
      :tooltip="false"
      :marks="marks"
  />
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';

const sleep = ref([6, 22]);

const sleepDifference = computed(() => Math.abs(sleep.value[0] - sleep.value[1]));

const sleepTime = computed(() => {
  return Math.min(sleepDifference.value, 24 - sleepDifference.value);
});

const reversed = computed(() => sleepTime.value !== sleepDifference.value);

const marks = computed(() => Object.fromEntries(sleep.value.map(time => [time, `${String(time).padStart(2, '0')}:00`])));
</script>

<style lang="scss">
.circadian-picker-slider-reversed {
  .n-slider-rail {
    background: rgb(24, 160, 88) !important;

    .n-slider-rail__fill {
      background: rgb(219, 219, 223) !important;
    }
  }
}
</style>