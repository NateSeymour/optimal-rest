<template>
  <div class="home">
    <n-form class="form" :rules="rules">
      <n-form-item path="sequence" label="Sequence Number">
        <n-input-number class="sequence-number" :show-button="false" placeholder="123" v-model:value="form.sequence" />
      </n-form-item>

      <n-form-item class="flight-item" v-for="(flight, index) in form.flights" :key="index" :show-feedback="false">
        <n-card class="flight-card" :title="`Day ${flight.day} - Flight ${index + 1}`">
          <template #header-extra>
            <n-button size="small" type="secondary" @click="() => removeFlight(index)">X</n-button>
          </template>

          <flight-picker 
            v-model:day="form.flights[index].day"
            v-model:departure="form.flights[index].departure"
            v-model:originCode="form.flights[index].origin"
            v-model:destinationCode="form.flights[index].destination"

            @add-return-flight="addFlight"
          />
        </n-card>
      </n-form-item>

      <div class="add-flight">
        <n-button type="primary" :strong="true" @click="() => addFlight()">+</n-button>
      </div>

      <n-divider />

      <div class="actions">
        <n-button class="calculate-rest" type="primary" @click="() => router.push(`/sequence/${form.sequence}`)">Calculate Rest</n-button>
      </div>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import FlightPicker from '../components/FlightPicker.vue';
import tc from 'timezonecomplete';
import type { FormRules } from 'naive-ui';
import type { Flight } from '../hooks/flight.ts';

const router = useRouter();

const rules : FormRules = {
  sequence: [
    {
      required: true,
    }
  ],
};

const form = reactive({
  sequence: 0,
  flights: [] as Flight[],
});

function sortFlights() {
  form.flights.sort((a, b) => {
    const daySort = a.day - b.day;

    return daySort || new tc.DateTime(a.departure).unixUtcMillis() - new tc.DateTime(b.departure).unixUtcMillis();
  });
}

watch(form.flights, () => {
  sortFlights();

  localStorage.setItem(`rest-sequence-${form.sequence}`, JSON.stringify(form, null, 4));
});

function addFlight(flight?: Flight) {  
  form.flights.push(flight || {
    day: form.flights.reduce((acc, current) => Math.max(acc, current.day), 1),
    departure: '12:00',
    origin: '',
    destination: '',
  });
}

function removeFlight(i: number) {
  form.flights.splice(i, 1);
}

onMounted(() => {
  addFlight();
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