<script setup lang="ts">
import { ref } from "vue";

const steps = ["Locate", "Draw", "Cutout", "Details", "Wash"];

const stepper = ref(0);
</script>

<template>
  <v-stepper v-model="stepper" style="max-width: 400px">
    <v-stepper-header>
      <template v-for="(step, i) in steps" :key="step">
        <v-stepper-item :complete="stepper > i">
          <div v-if="stepper === i">
            {{ step }}
          </div>
        </v-stepper-item>
        <v-divider v-if="i < steps.length - 1" />
      </template>
    </v-stepper-header>
    <v-stepper-window>
      <v-stepper-window-item>
        <div class="pa-4">
          <h4 class="text-h4">Step 1</h4>
          <p class="text-subtitle-2 mb-2">Locate your project</p>
          <p class="text-body-2">Locate your project using the location tool at the top of the map!</p>
          <div class="d-flex justify-end mt-2">
            <v-btn color="primary" rounded @click="stepper++">Next</v-btn>
          </div>
        </div>
      </v-stepper-window-item>

      <v-stepper-window-item>
        <div class="pa-4">
          <h4 class="text-h4">Step 2</h4>
          <p class="text-subtitle-2 mb-2">Outline your project</p>
          <p class="text-body-2">Draw your project by clicking each corner on the map.</p>
          <div class="d-flex mt-2">
            <v-btn color="primary" rounded @click="stepper--">back</v-btn>
          </div>
        </div>
      </v-stepper-window-item>
    </v-stepper-window>
  </v-stepper>
</template>

<style scoped>
.v-window.v-stepper-window {
  margin: 0;
}
</style>
