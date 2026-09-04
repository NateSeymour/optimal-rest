<template>
  <div class="rest-calculation">
    <n-card title="Sequence">
      <n-date-picker
          v-model:formatted-value="date"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
      />
    </n-card>

    <n-card title="My Sleep Schedule">
      <CircadianPicker
          @update="(value) => circadianRhythm = value"
      />
    </n-card>

    <div v-if="schedule">
      <ScheduleView
          :schedule="schedule"
          :scale="4"
          :columns="[
              ['circadian-sleep'],
              ['preparation', 'transportation', 'briefing', 'flight', 'debrief']
          ]"
          :colors="{
            'circadian-sleep': '#4997d0',
          }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useRoute} from 'vue-router';
import {loadSequence} from '../../lib/sequence.ts';
import {computed, type Ref, ref} from 'vue';
import CircadianPicker from '../../components/CircadianPicker.vue';
import {createOptimizedRestSchedule} from '../../lib/rest.ts';
import type {CircadianRhythm} from '../../lib/sleep.ts';
import ScheduleView from '../../components/ScheduleView.vue';

const route = useRoute();

const date = ref();

const circadianRhythm: Ref<CircadianRhythm> = ref({
  bedtime: 22,
  duration: 8,
});

const schedule = computed(() => {
  const sequence = loadSequence(`sequence-${route.params.sequence}`);
  if(!sequence || !date.value) return null;

  return createOptimizedRestSchedule(sequence, date.value, circadianRhythm.value);
});
</script>

<style lang="scss" scoped>
.loading-anim {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

div.rest-calculation {
  padding: 1em;
  display: flex;
  flex-direction: column;
  gap: 1em;

  .statistics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>