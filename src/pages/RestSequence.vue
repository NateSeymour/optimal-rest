<template>
  <div class="rest-calculation">
    <n-card title="Overview">
      <div class="statistics">
        <n-statistic label="Flights" :value="flights.length" />
        <n-statistic label="Days" :value="totalDays" />

        <n-statistic label="Total Distance" :value="totalDistance">
          <template #suffix>mi</template>
        </n-statistic>
        <n-statistic label="Flight Time" :value="totalFlightTime.toHmsString(false)" />

        <n-statistic label="Unscheduled Time" :value="schedule.unscheduledTime.toHmsString(false)" />
        <n-statistic label="Scheduled Time" :value="schedule.scheduledTime.toHmsString(false)" />

        <n-statistic label="Scheduled Sleep" :value="schedule.scheduledSleep.toHmsString(false)" />
      </div>
    </n-card>

    <n-card title="Options">
      <n-form>
        <n-form-item label="Sequence Date">
          <n-date-picker v-model:formatted-value="sequenceStartDate" type="date" value-format="yyyy-MM-dd" />
        </n-form-item>

        <n-form-item label="Day 1 Wake-Up">
          <n-time-picker v-model:formatted-value="dayOneWakeUp" value-format="HH:mm" format="HH:mm" />
        </n-form-item>

        <n-collapse>
          <n-collapse-item title="Sign In">
            <n-form-item label="Minimum Wake-Up to Departure Time">
              <n-input-number />
            </n-form-item>
          </n-collapse-item>

          <n-collapse-item title="Crew Rest Options">
            <n-form-item label="Minimum Miles for Crew Rest">
              <n-input-number />
            </n-form-item>

            <n-form-item label="Average Crew Rest Duration (Minutes)">
              <n-input-number />
            </n-form-item>
          </n-collapse-item>
        </n-collapse>
      </n-form>
    </n-card>

    <n-card title="Optimized Rest Schedule">
      <template #header-extra>
        <n-icon size="medium">
          <info-circle />
        </n-icon>
      </template>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import {useRoute} from "vue-router";
import {useLocalStorage} from "@vueuse/core";
import {computed} from "vue";
import {type Flight, resolveFlight} from "../hooks/flight.ts";
import {Schedule} from "../hooks/schedule.ts";
import tc, {DateTime, Duration} from "timezonecomplete";

const route = useRoute();
const sequence = useLocalStorage(`sequence-${route.params.sequence}`, {
    number: route.params.sequence,
    date: '01/01/2001',
    flights: [] as [string, Flight][],
});

const flights = computed(() => {
  return sequence.value.flights.map(([_, flight]) => resolveFlight(flight));
});

const schedule = computed(() => {
  const schedule = new Schedule();

  schedule.importItems(flights.value, (flight) => {
    const departureTime = new Duration(flight.departure);
    const start = new DateTime(flight.departure, tc.zone(flight.origin!.tz))
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