<template>
  <div class="rest-calculation">
    <n-card title="Overview">
      <div class="statistics">
      </div>
    </n-card>

    <n-card title="Options">
      <n-form>
      </n-form>
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
import {useRoute} from "vue-router";
import {useLocalStorage} from "@vueuse/core";
import {computed, ref} from "vue";
import {type Flight, resolveFlight} from "../hooks/flight.ts";
import {Schedule} from "../hooks/schedule.ts";
import tc, {DateTime, Duration} from "timezonecomplete";
import {InfoCircle} from "@vicons/fa";
import ScheduleView from "../components/ScheduleView.vue";

const route = useRoute();
const sequence = useLocalStorage(`sequence-${route.params.sequence}`, {
    number: route.params.sequence,
    date: '01/01/2001',
    flights: [] as [string, Flight][],
});

const flights = computed(() => {
  return sequence.value.flights.map(([_, flight]) => resolveFlight(flight));
});

const options = ref({});

const schedule = computed(() => {
  const schedule = new Schedule();

  schedule.importItems(flights.value, (flight) => {
    const departureTime = new Duration(flight.departure);
    const start = new DateTime(sequence.value.date, tc.zone(flight.origin!.tz))
        .add(tc.days(flight.period - 1))
        .add(departureTime);

    return {
      type: 'Flight',
      duration: flight.duration,

      timing: 'absolute',
      start,
    };
  });

  console.log(schedule);

  return schedule;
});

const circadianSchedule = computed(() => {
  const schedule = new Schedule();

  return schedule;
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