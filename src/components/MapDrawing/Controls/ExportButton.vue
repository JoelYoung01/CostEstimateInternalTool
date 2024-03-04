<script setup lang="ts">
import { ref, computed } from "vue";
import { useDataPackageStore } from "@/stores/dataPackage";

const dataPackageStore = useDataPackageStore();

const showCheckMark = ref(false);

/** Whether to disable the button */
const disableButton = computed(() => showCheckMark.value || !dataPackageStore.dataPackage.drawnAreas.length);

/**
 * Export the data to the clipboard
 */
async function exportDataToClipboard() {
  try {
    const encodedData = dataPackageStore.exportToEncodedString();

    if (!encodedData) {
      console.error("No data to export");
      return;
    }

    if (dataPackageStore.exportErrors.length) {
      console.error("Errors exporting data", dataPackageStore.exportErrors);
      return;
    }

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
