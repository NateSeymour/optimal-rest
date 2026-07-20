<template>
  <div class="schedule">
    <div class="event" v-for="event in schedule.events" :style="{ height: `${scale * event.duration.hours()}em` }">
      {{ event.type }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Schedule } from "../hooks/schedule.ts";
import {computed} from "vue";

const { schedule, scale } = defineProps<{
  schedule: Schedule,
  scale: number,
}>();

const totalHours = computed(() => {
  const first = schedule.start;
  const last = schedule.end;

  if(!first || !last) return 0;

  return Math.ceil(last.start.add(last.duration).diff(first.start).hours());
});
</script>

<style scoped lang="scss">

</style>