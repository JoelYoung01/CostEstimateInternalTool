<script setup lang="ts">
import MapWidgetRoot from "@/components/MapDrawing/MapWidgetRoot.vue";
import { DefaultDataPackage, DataPackageInjectionKey } from "@/injections";
import type { DataPackage } from "@/types";
import { ref, provide } from "vue";

const dataPackage = ref<DataPackage>(DefaultDataPackage);
provide(DataPackageInjectionKey, dataPackage);
</script>

<template>
  <v-main>
    <v-container flat class="px-lg-10 px-4">
      <MapWidgetRoot />
    </v-container>
  </v-main>
</template>
