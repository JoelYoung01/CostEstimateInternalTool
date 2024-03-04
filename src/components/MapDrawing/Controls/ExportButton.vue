<script setup lang="ts">
import { inject, ref, computed } from "vue";
import { DataPackageInjectionKey, DefaultDataPackage } from "@/injections";
import type { DataPackage } from "@/types";

const dataPackage = inject(DataPackageInjectionKey, ref<DataPackage>(DefaultDataPackage));

const showCheckMark = ref(false);

/** Whether to disable the button */
const disableButton = computed(() => showCheckMark.value || !dataPackage.value.drawnAreas.length);

/**
 * Export the data to the clipboard
 */
async function exportDataToClipboard() {
  try {
    const stringifiedData = JSON.stringify(dataPackage.value);
    const encodedData = btoa(stringifiedData);
    navigator.clipboard.writeText(encodedData);
    animateCheckMark();
  } catch (e) {
    console.error(e);
  }
}

/**
 * Animate the check mark
 */
async function animateCheckMark() {
  showCheckMark.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  showCheckMark.value = false;
}
</script>

<template>
  <v-btn
    variant="text"
    icon
    @click="exportDataToClipboard()"
    :disabled="disableButton"
    :color="showCheckMark ? 'success' : ''"
  >
    <v-icon v-if="showCheckMark">mdi-check</v-icon>
    <v-icon v-else>mdi-export</v-icon>

    <v-tooltip activator="parent" location="top">Export Data to clipboard</v-tooltip>
  </v-btn>
</template>
