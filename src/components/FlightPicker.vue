<template>
  <div>
    <n-form :rules="rules">
      <div class="departure-time">
        <n-form-item label="Duty Period">
          <n-input-number 
            v-model:value="flight.period"
            :min="1"
            :max="10"
          />
        </n-form-item>

         <n-form-item label="Departure Time">
          <n-time-picker 
            v-model:formatted-value="flight.departure"
            format="HH:mm"
            value-format="HH:mm"
          />
        </n-form-item>
      </div>
      
      <div class="pairing">
        <n-form-item path="origin" label="Origin">
          <n-auto-complete 
            v-model:value="originCode"
            :options="useAirportAutocomplete(originCode)"
            placeholder="CLT"
            :render-label="autocompleteLabel"
            blur-after-select
            clearable
          />
        </n-form-item>

        <n-form-item path="destination" label="Destination">
          <n-auto-complete 
            v-model:value="destinationCode" 
            :options="useAirportAutocomplete(destinationCode)"
            placeholder="CDG"
            :render-label="autocompleteLabel"
            blur-after-select
            clearable
          />
        </n-form-item>
      </div>
    </n-form>

    <div v-if="flight.origin && flight.destination" class="pairing-display">
      <span>{{ flight.origin.mun }}</span>
      <n-icon>
        <plane-departure />
      </n-icon>
      <span>{{ flight.destination.mun }}</span>
    </div>

    <div v-if="flight.origin && flight.destination" class="statistics">
      <n-statistic label="Distance" :value="flight.distance">
        <template #suffix>mi</template>
      </n-statistic>

      <n-statistic label="Flight Time (Approx.)" :value="`${flight.flightTime.wholeHours()}:${flight.flightTime.minute()}`" />
    </div>

    <div v-if="flight.origin && flight.destination" class="controls">
      <n-button 
        class="add-return-flight"
        @click="() => emit('add-return-flight', { id: uuid(), day: flight.day + 1, departure: flight.departure, origin: flight.destination, destination: flight.origin })"
      >
        Add Return Flight
      </n-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  calculateDistance,
  calculateFlightTime,
  calculateHeading,
  type Flight,
  getAirport,
  useAirportAutocomplete
} from '../hooks/flight';
import { v4 as uuid } from 'uuid';
import type { FormRules, SelectOption } from 'naive-ui';
import { PlaneDeparture } from '@vicons/fa';
import {ref, watch} from "vue";
import {validateAirportCode} from "../util/validation.ts";

const emit = defineEmits(['add-return-flight']);

const flight = defineModel<Flight>('value', { required: true });

const originCode = ref(flight.value.origin?.iata || '');
const destinationCode = ref(flight.value.destination?.iata || '');

watch([originCode, destinationCode], ([newOrigin, newDestination]) => {
  const origin = getAirport(newOrigin);
  const destination = getAirport(newDestination);

  flight.value.origin = origin;
  flight.value.destination = destination;
  flight.value.distance = calculateDistance(origin, destination);
  flight.value.heading = calculateHeading(origin, destination);
  flight.value.flightTime = calculateFlightTime(origin, destination);
});

const rules : FormRules = {
  origin: [validateAirportCode(originCode, { required: true })],
  destination: [validateAirportCode(destinationCode, { required: true })],
};

const autocompleteLabel = (option: SelectOption) => {
  const airport = getAirport(option.label as string)

  if(!airport) {
    return `Unknown Airport (${option.label})`;
  }

  return `${airport.name} (${airport.iata}/${airport.icao})`;
}
</script>

<style lang="scss" scoped>
.departure-time {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  gap: 0.5em;
}

.pairing-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25em;
  margin-bottom: 1em;
}

.statistics {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.controls {
  margin-top: 2em;
  
  .add-return-flight {
    width: 100%;
  }
}
</style>