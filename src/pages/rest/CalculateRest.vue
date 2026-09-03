<template>
  <div class="rest-calculation">
    <n-card title="Sequence">
      <n-date-picker
          v-model:value="date"
          format="dd.MM.YYYY"
      />
    </n-card>

    <n-card title="My Sleep Schedule">
      <CircadianPicker
          @update="(value) => circadianRhythm = value"
      />
    </n-card>

    <!-- <ScheduleView :schedule="schedule" :scale="1" /> -->
  </div>
</template>

<script lang="ts" setup>
import {useRoute} from 'vue-router';
import {InfoCircle} from '@vicons/fa';
import ScheduleView from '../../components/ScheduleView.vue';
import {loadSequence} from '../../lib/sequence.ts';
import {computed, type Ref, ref} from 'vue';
import CircadianPicker from '../../components/CircadianPicker.vue';
import {createOptimizedRestSchedule} from "../../lib/rest.ts";
import type {CircadianRhythm} from "../../lib/sleep.ts";
import tc from 'timezonecomplete';

const route = useRoute();

const date = ref('01.01.2001');

const circadianRhythm: Ref<CircadianRhythm> = ref({
  bedtime: tc.hours(22),
  sleeptime: tc.hours(8),
});

const schedule = computed(() => {
  const sequence = loadSequence(`sequence-${route.params.sequence}`);
  if(!sequence) return null;

  return createOptimizedRestSchedule(sequence, date.value);
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