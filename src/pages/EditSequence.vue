<template>
  <div class="home">
    <n-form class="form" :rules="rules">
      <n-form-item class="flight-item" v-for="(flight, index) in flights" :key="flight.id" :show-feedback="false">
        <n-card class="flight-card" :title="`Day ${flight.day} - Flight ${index + 1}`">
          <template #header-extra>
            <n-button size="small" @click="() => removeFlight(index)">X</n-button>
          </template>

          <flight-picker 
            v-model:value="flights[index].data as Flight"

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
import {useRoute, useRouter} from 'vue-router';
import FlightPicker from '../components/FlightPicker.vue';
import type { FormRules } from 'naive-ui';
import { Flight } from '../hooks/flight.ts';
import { useLocalStorage } from "@vueuse/core";
import {Event, Schedule} from "../hooks/schedule.ts";
import {watch} from "vue";

const router = useRouter();
const route = useRoute();

const rules : FormRules = {
  sequence: [
    {
      required: true,
    }
  ],
};

const sequence = useLocalStorage(`sequence-${route.params.sequence}`, {
  number: route.params.sequence,
  date: '01/01/2001',
  schedule: new Schedule(),
});

function addFlight(flight?: Flight) {
  sequence.value.schedule.add(new Event({ data: flight || new Flight() }));
}

function removeFlight(i: number) {
  flights.value.splice(i, 1);
}

watch(sequence, (newSequence) => {
  if(newSequence && newSequence.schedule.events.length === 0) {
    addFlight();
  }
}, { immediate: true });
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