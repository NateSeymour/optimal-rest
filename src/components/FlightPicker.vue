<template>
  <div>
    <n-form :rules="rules">
      <div class="departure-time">
        <n-form-item label="Day">
          <n-input-number 
            ref="dayInputRef"
            v-model:value="day"
            :min="1"
            :max="10"
            @update:value="() => dayInputRef.blur()"
          />
        </n-form-item>

         <n-form-item label="Departure Time">
          <n-time-picker 
            v-model:formatted-value="departure"
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

    <div v-if="origin && destination" class="pairing-display">
      <span>{{ origin.mun }}</span>
      <n-icon>
        <plane-departure />
      </n-icon>
      <span>{{ destination.mun }}</span>
    </div>

    <div v-if="origin && destination" class="statistics">
      <n-statistic label="Distance" :value="distance">
        <template #suffix>mi</template>
      </n-statistic>

      <n-statistic label="Flight Time (Approx.)" :value="`${flightTime.wholeHours()}:${flightTime.minute()}`" />
    </div>

    <div v-if="origin && destination" class="controls">
      <n-button 
        class="add-return-flight"
        @click="() => emit('add-return-flight', { day: day + 1, departure, origin: destination!.iata, destination: origin!.iata })"
      >
        Add Return Flight
      </n-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { getAirport, useAirportAutocomplete, useFlight } from '../hooks/flight';
import type { FormRules, SelectOption } from 'naive-ui';
import { PlaneDeparture } from '@vicons/fa';

const emit = defineEmits(['add-return-flight']);

const dayInputRef = ref();

const day = defineModel('day', { default: 1 });
const departure = defineModel('departure', { default: '12:00' });
const originCode = defineModel('originCode', { default: '' });
const destinationCode = defineModel('destinationCode', { default: '' });

const {origin, destination, distance, flightTime} = useFlight(originCode, destinationCode);

const flightValidationRule = {
  required: true,
  validator: () => {
    if(!origin.value) {
      return new Error(`${originCode.value.toUpperCase()} is not a valid airport code.`);
    }
  },
  trigger: ['input', 'blur', 'change']
};

const rules : FormRules = {
  origin: [flightValidationRule],
  destination: [flightValidationRule],
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