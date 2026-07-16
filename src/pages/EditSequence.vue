<template>
  <div class="home">
    <n-form class="form" :rules="rules">
      <n-form-item class="flight-item" v-for="(flight, index) in flights" :key="flight.id" :show-feedback="false">
        <n-card class="flight-card" :title="`Day ${flight.day} - Flight ${index + 1}`">
          <template #header-extra>
            <n-button size="small" @click="() => removeFlight(index)">X</n-button>
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
import { computed } from 'vue';
import {useRoute, useRouter} from 'vue-router';
import { v4 as uuid } from 'uuid';
import FlightPicker from '../components/FlightPicker.vue';
import tc from 'timezonecomplete';
import type { FormRules } from 'naive-ui';
import type { Flight } from '../hooks/flight.ts';
import { useLocalStorage } from "@vueuse/core";
import {Event, Schedule} from "../hooks/schedule.ts";

const router = useRouter();
const route = useRoute();

const rules : FormRules = {
  sequence: [
    {
      required: true,
    }
  ],
};

const sequence = useLocalStorage(`sequence-${route.params.sequence}`, new Schedule());
const flights = computed(() => {
  return sequence.value.filterByProperty('type', 'flight');
});

function addFlight(flight?: Flight) {
  sequence.value.add(new Event('Flight').with({ type: 'flight' }));
}

function removeFlight(i: number) {
  flights.value.splice(i, 1);
}
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