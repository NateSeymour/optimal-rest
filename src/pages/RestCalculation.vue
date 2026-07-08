<template>
  <div class="loading-anim" v-if="state === 'loading'">
    <n-spin />
  </div>
  <div class="rest-calculation" v-else>
    <n-card title="Overview">
      <div class="statistics">
        <n-statistic label="Flights" :value="flights.length" />
        <n-statistic label="Days" :value="totalDays" />
        <n-statistic label="Total Distance" :value="totalDistance">
          <template #suffix>mi</template>
        </n-statistic>
        <n-statistic label="Flight Time" :value="`${totalFlightTime.wholeHours()}:${totalFlightTime.minute()}`" />
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

      <n-timeline>
        <n-timeline-item 
          v-for="(event, index) in optimizedRestSchedule" 
          :key="index"
          :content="event.content"
          :time="event.time"
        />
      </n-timeline>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import tc, { Duration } from 'timezonecomplete';
import { resolveFlight, useSequenceStats, type ResolvedFlight } from '../hooks/flight';
import { InfoCircle } from '@vicons/fa';

const router = useRouter();
const route = useRoute();

const state = ref('loading');
const flights = ref<ResolvedFlight[]>([]);
// @ts-ignore
const { totalDays, totalDistance, totalFlightTime } = useSequenceStats(flights);

// Options
const sequenceStartDate = ref(new tc.DateTime().format('yyyy-MM-dd'));
const dayOneWakeUp = ref(new tc.DateTime().format('HH:mm'));

// Rest Schedule
const optimizedRestSchedule = computed(() => {
  const events = [];

  const timeFormat = 'MM/dd HH:mm OOOO';

  for(const flight of flights.value) {
    const departure = {
      content: `Departure from ${flight.origin.mun}`,
      time: new tc.DateTime(sequenceStartDate.value, tc.zone(flight.origin.tz)).add(tc.days(flight.day - 1)).add(new tc.Duration(flight.departure)),
    };

    const signIn = {
      content: `Sign in for flight to ${flight.destination.mun}`,
      time: departure.time.sub(new tc.Duration("01:15")),
    };

    const transportation = {
      content: `Leave for ${flight.origin.iata}`,
      time: signIn.time.sub(new tc.Duration("01:15")),
    };

    const prepare = {
      content: `Prepare for flight to ${flight.destination.mun}`,
      time: transportation.time.sub(tc.hours(1)),
    };

    const arrival = {
      content: `Arrival in ${flight.destination.mun}`,
      time: departure.time.add(flight.flightTime as Duration).convert(tc.zone(flight.destination.tz)),
    };

    events.push(prepare, transportation, signIn, departure, arrival);
  }

  events.sort((a, b) => a.time.unixUtcMillis() - b.time.unixUtcMillis());

  return events.map((event) => ({
    content: event.content,
    time: event.time.format(timeFormat),
  }));
});

onMounted(() => {
  const savedSequence = localStorage.getItem(`rest-sequence-${route.params.sequence}`);

  if(savedSequence) {
    const value = JSON.parse(savedSequence);

    flights.value = value.flights.map(resolveFlight);

    state.value = 'ready';
  } else {
    router.push('/');
  }
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