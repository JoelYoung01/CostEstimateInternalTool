<script setup lang="ts">
import MapWidgetRoot from "./MapDrawing/MapWidgetRoot.vue";
import { inject, ref } from "vue";
import { DataPackageInjectionKey, DefaultDataPackage } from "@/injections";

const dataPackage = inject(DataPackageInjectionKey, ref(DefaultDataPackage));

const emit = defineEmits(["confirm", "back"]);
</script>

<template>
  <v-card flat class="px-lg-10 px-4">
    <MapWidgetRoot />

    <div class="d-flex mx-n2 mt-4">
      <v-btn slim variant="text" @click="emit('back')">Back</v-btn>
      <v-spacer />
      <v-btn
        variant="flat"
        color="primary"
        class="px-4"
        rounded
        :disabled="dataPackage.drawnAreas.length === 0"
        slim
        @click="emit('confirm')"
      >
        Confirm
      </v-btn>
    </div>
  </v-card>
</template>
