<template>
  <div class="home">
    <n-card title="New Sequence">
      <n-form>
        <n-form-item label="Sequence Number">
          <n-input-number class="new-sequence-number" placeholder="123" v-model:value="newSequenceNumber" />
        </n-form-item>

        <n-button class="create-button" type="primary" @click="createSequence">Create Sequence</n-button>
      </n-form>
    </n-card>

    <n-card v-if="savedSequences.length > 0" title="Past Sequences">
      <div class="past-sequences">
        <n-button class="sequence-button" type="primary" v-for="sequence in savedSequences" @click="() => loadSequence(sequence)">Sequence {{ sequence }}</n-button>
      </div>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import {useLocalStorage} from "@vueuse/core";
import {ref} from "vue";
import {useRouter} from "vue-router";

const router = useRouter();

const newSequenceNumber = ref();
const savedSequences = useLocalStorage('sequences', [] as number[]);

function createSequence() {
  if(!newSequenceNumber.value) return;

  if(savedSequences.value.find((sequence) => sequence === newSequenceNumber.value)) {
    router.push(`/rest/${newSequenceNumber.value}`);
  } else {
    savedSequences.value.push(newSequenceNumber.value);
    router.push(`/edit/${newSequenceNumber.value}`);
  }
}

function loadSequence(sequence: number) {
  router.push(`/rest/${sequence}`);
}
</script>

<style lang="scss" scoped>
.home {
  padding: 1em;

  .new-sequence-number {
    width: 100%;
  }

  .create-button {
    width: 100%;
  }

  .past-sequences {
    display: flex;
    flex-direction: column;
    gap: 1em;

    .sequence-button {
      width: 100%;
    }
  }
}
</style>