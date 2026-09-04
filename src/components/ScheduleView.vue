<template>
  <div class="schedule">
    <div class="tz-primary">
      <div class="time-box" v-for="i in end.diff(start).wholeHours()" :key="i" :style="{ height: `${scale}em` }">
        <span class="time">{{ String(start.add(tc.hours(i - 1)).hour()).padStart(2, '0') }}:00</span>
      </div>
    </div>

    <div class="events">
      <div class="column" v-for="(column, i) in columns" :key="i">
        <div class="time-line" v-for="i in end.diff(start).wholeHours()" :key="i" :style="{ height: `${scale}em` }"></div>

        <div class="event" v-for="event in schedule.filter(e => column.includes(e.type))" :key="event.id!" :style="computeEventStyle(event)">
          <div class="event-body" :style="{ background: colors?.[event.type] || 'red' }">
            {{ event.title || event.type }}
          </div>
        </div>
      </div>
    </div>

    <div class="tz-secondary">

    </div>
  </div>
</template>

<script setup lang="ts">
import type {Schedule, ScheduleEvent} from '../lib/schedule.ts';
import {computed} from 'vue';
import tc from 'timezonecomplete';

const { schedule, scale } = defineProps<{
  schedule: Schedule;
  scale: number;
  columns: string[][];
  secondaryTz?: string;
  colors?: Record<string, string>;
}>();

const start = computed(() => schedule.at(0)?.start || tc.DateTime.now());
const end = computed(() => schedule.at(-1)?.end || tc.DateTime.now());

const computeEventStyle = (event: ScheduleEvent) => {
  return {
    top: `${scale * event.start!.diff(start.value).hours()}em`,
    height: `${scale * event.duration!.hours()}em`
  };
};
</script>

<style scoped lang="scss">
.schedule {
  display: flex;
  flex-direction: row;

  .tz-primary {
    .time-box {
      box-sizing: border-box;
      border-top: 1px solid gray;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .events {
    width: 100%;
    display: flex;
    flex-direction: row;

    .column {
      position: relative;
      flex-grow: 1;

      .time-line {
        box-sizing: border-box;
        border-top: 1px solid gray;
      }

      .event {
        position: absolute;
        width: 100%;
        padding: 0 0.5em 0 0.5em;
        box-sizing: border-box;

        .event-body {
          font-weight: bold;
          font-size: 14px;
          color: white;
          border-radius: 0.5em;
          opacity: 0.9;
          height: calc(100% - 0.1em);
          width: 100%;
          box-sizing: border-box;
          padding: 0.25em;
        }
      }
    }
  }
}
</style>