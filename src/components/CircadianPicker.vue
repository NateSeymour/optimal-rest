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
import {computed, type ComputedRef, ref, watch} from 'vue';
import type { CircadianRhythm } from '../lib/sleep';
import tc from 'timezonecomplete';

const emit = defineEmits(['update']);

const sleep = ref([6, 22]);

const reversed = computed(() => Math.abs(sleep.value[0] - sleep.value[1]) > 12);

const circadianRhythm: ComputedRef<CircadianRhythm> = computed(() => {
  const diff = Math.abs(sleep.value[0] - sleep.value[1]);

  return {
    bedtime: tc.hours(reversed.value ? sleep.value[0] : sleep.value[1]),
    sleeptime: tc.hours(Math.min(diff, 24 - diff)),
  };
});

const marks = computed(() => Object.fromEntries(sleep.value.map(time => [time, `${String(time).padStart(2, '0')}:00`])));

watch(circadianRhythm, (newCircadianRhythm) => {
  emit('update', newCircadianRhythm);
}, { immediate: true });
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