<script setup lang="ts">
import { ref, computed } from "vue";
import { useDataPackageStore } from "@/stores/dataPackage";
import { useRoute } from "vue-router";

interface Props {
  mode?: "link" | "data";
}

const props = withDefaults(defineProps<Props>(), {
  mode: "link"
});

const dataPackageStore = useDataPackageStore();

const route = useRoute();

const showCheckMark = ref(false);

/** Whether to disable the button */
const disableButton = computed(() => showCheckMark.value || !dataPackageStore.dataPackage.drawnAreas.length);

/** The tooltip text */
const tooltipText = computed(() =>
  props.mode === "link" ? "Export Data as Link to clipboard" : "Export Data to clipboard"
);

/**
 * Export the data to the clipboard
 */
function exportDataToClipboard() {
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
 * Export the data as a link to the clipboard
 */
function exportDataAsLinkToClipboard() {
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

    // Create url using hash history mode
    const url = new URL(window.location.href);
    url.hash = `#${route.fullPath}?data=${encodedData}`;
    navigator.clipboard.writeText(url.toString());
    animateCheckMark();
  } catch (e) {
    console.error(e);
  }
}

function onClick() {
  if (props.mode === "link") {
    exportDataAsLinkToClipboard();
  } else {
    exportDataToClipboard();
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
  <v-btn variant="text" icon @click="onClick" :disabled="disableButton">
    <v-fab-transition absolute-on-leave>
      <v-icon v-if="showCheckMark">mdi-check</v-icon>
      <v-icon v-else>mdi-export</v-icon>
    </v-fab-transition>

    <v-tooltip activator="parent" location="top">{{ tooltipText }}</v-tooltip>
  </v-btn>
</template>
