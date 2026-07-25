<template>
  <div class="schedule">
    <div class="event" v-for="event in schedule" :key="event.start.unixUtcMillis()" :style="{ height: `${scale * event.duration.hours()}em` }">
      {{ event.type }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type {Schedule} from '../lib/schedule.ts';

const { schedule, scale } = defineProps<{
  schedule: Schedule,
  scale: number,
}>();
</script>

<style scoped lang="scss">

</style>