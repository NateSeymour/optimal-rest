<template>
  <div class="home">
    <n-form class="form" :rules="rules">
      <n-form-item path="sequence" label="Sequence Number">
        <n-input-number class="sequence-number" :show-button="false" placeholder="123" v-model:value="sequence" />
      </n-form-item>

      <n-form-item class="flight-item" v-for="(flight, index) in sortedFlights" :key="flight.id" :show-feedback="false">
        <n-card class="flight-card" :title="`Day ${flight.day} - Flight ${index + 1}`">
          <template #header-extra>
            <n-button size="small" type="secondary" @click="() => removeFlight(index)">X</n-button>
          </template>

          <flight-picker 
            v-model:day="flights[index].day"
            v-model:departure="flights[index].departure"
            v-model:originCode="flights[index].origin"
            v-model:destinationCode="flights[index].destination"

            @add-return-flight="addFlight"
          />
        </n-card>
      </n-form-item>

      <div class="add-flight">
        <n-button type="primary" :strong="true" @click="() => addFlight()">+</n-button>
      </div>

      <n-divider />

      <div class="actions">
        <n-button class="calculate-rest" type="primary" @click="() => router.push(`/sequence/${sequence}`)">Calculate Rest</n-button>
      </div>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { v4 as uuid } from 'uuid';
import FlightPicker from '../components/FlightPicker.vue';
import tc from 'timezonecomplete';
import type { FormRules } from 'naive-ui';
import type { Flight } from '../hooks/flight.ts';
import { useLocalStorage } from "@vueuse/core";

const router = useRouter();

const rules : FormRules = {
  sequence: [
    {
      required: true,
    }
  ],
};

const sequence = ref(0);
const flightKey = computed(() => `sequence-${sequence.value}`);
const flights = useLocalStorage(flightKey, [] as Flight[]);

const sortedFlights = computed(() => {
  return flights.value.sort((a, b) => {
    const daySort = a.day - b.day;

    return daySort || new tc.Duration(a.departure).milliseconds() - new tc.Duration(b.departure).milliseconds();
  });
});

function addFlight(flight?: Flight) {  
  flights.value.push(flight || {
    id: uuid(),
    day: flights.value.reduce((acc, current) => Math.max(acc, current.day), 1),
    departure: '12:00',
    origin: '',
    destination: '',
  });
}

function removeFlight(i: number) {
  flights.value.splice(i, 1);
}

onMounted(() => {
  if(flights.value.length < 1) {
    addFlight();
  }
});
</script>

<style lang="scss" scoped>
.home {
  padding: 1em;

  h1 {
    margin-bottom: 0;
  }

  h3 {
    margin-top: 0;
  }

  .sequence-number {
    width: 100%;
  }

  .add-flight {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2em 0 0 1em;
  }

  .actions {
    .calculate-rest {
      width: 100%;
    }
  }
}
</style>