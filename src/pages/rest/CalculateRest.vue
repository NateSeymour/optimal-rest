<template>
  <div class="rest-calculation">
    <n-card title="Circadian Rhythm">
      <CircadianPicker />
    </n-card>

    <n-card title="Schedule">
      <template #header-extra>
        <n-icon size="medium">
          <info-circle />
        </n-icon>
      </template>

      <ScheduleView :schedule="schedule" :scale="1" />
      <ScheduleView :schedule="circadianSchedule" :scale="1" />
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import {useRoute} from 'vue-router';
import {InfoCircle} from '@vicons/fa';
import ScheduleView from '../../components/ScheduleView.vue';
import {loadSequence} from '../../lib/sequence.ts';
import {computed} from 'vue';
import CircadianPicker from '../../components/CircadianPicker.vue';

const route = useRoute();
const sequence = computed(() => {
  return loadSequence(`sequence-${route.params.sequence}`, '01/01/2001');
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