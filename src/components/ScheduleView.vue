<template>
  <div class="schedule">
    <div class="tz-primary">
      <div v-for="i in totalHours" :key="i" :style="{ height: `${scale}em` }">
        {{ String((i - 1 + startingHour) % 24).padStart(2, '0') }}:00
      </div>
    </div>

    <div class="events">
      <div class="event" v-for="event in schedule" :key="event.id!" :style="computeEventStyle(event)">
        <div class="event-body" :style="{ background: colors[event.type] || 'red' }">
          {{ event.title || event.type }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {Schedule, ScheduleEvent} from '../lib/schedule.ts';
import {computed} from "vue";
import tc, {TimeUnit} from "timezonecomplete";

const colors: Record<string, string> = {
  'circadian-sleep': 'blue',
};

const { schedule, scale } = defineProps<{
  schedule: Schedule,
  scale: number,
}>();

const startTime = computed(() => schedule.at(0)?.start || tc.DateTime.now());
const startingHour = computed(() => schedule.at(0)?.start?.hour() || 0);
const totalHours = computed(() => schedule.at(-1)!.end!.diff(schedule.at(0)!.start!).hours());

const computeEventStyle = (event: ScheduleEvent) => {
  return {
    transform: `translateY(${scale * event.start!.diff(startTime.value).hours()}em)`,
    height: `${scale * event.duration!.hours()}em`
  };
};
</script>

<style scoped lang="scss">
.schedule {
  display: flex;
  flex-direction: row;
  gap: 1em;

  .tz-primary {
  }

  .events {
    .event {
      .event-body {
        font-weight: bold;
        font-size: 16px;
        color: white;
        border-radius: 0.75em;
        width: 100%;
        height: 100%;
        opacity: 0.9;
      }
    }
  }
}
</style>