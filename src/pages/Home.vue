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
        <div class="sequence" v-for="sequence in savedSequences" :key="sequence">
          <n-button class="sequence-button" type="primary" @click="() => loadSequence(sequence)">Sequence {{ sequence }}</n-button>
          <n-button class="delete-button" type="error" @click="() => deleteSequence(sequence)" secondary>
            <n-icon>
              <Trash />
            </n-icon>
          </n-button>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import {useLocalStorage} from '@vueuse/core';
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {Trash} from '@vicons/fa';

const router = useRouter();

const newSequenceNumber = ref();
const savedSequences = useLocalStorage('sequences', [] as number[]);

function createSequence() {
  if(!newSequenceNumber.value) return;

  if(savedSequences.value.find((sequence) => sequence === newSequenceNumber.value)) {
    router.push(`/rest/calculate/${newSequenceNumber.value}`);
  } else {
    savedSequences.value.push(newSequenceNumber.value);
    router.push(`/sequence/create/${newSequenceNumber.value}`);
  }
}

function loadSequence(sequence: number) {
  router.push(`/rest/calculate/${sequence}`);
}

function deleteSequence(sequence: number) {
  savedSequences.value = savedSequences.value.filter(value => value !== sequence);

  localStorage.removeItem(`sequence-${sequence}`);
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

    .sequence {
      width: 100%;
      display: flex;
      flex-direction: row;
      gap: 0.25em;

      .sequence-button {
        flex-grow: 1;
      }
    }
  }
}
</style>