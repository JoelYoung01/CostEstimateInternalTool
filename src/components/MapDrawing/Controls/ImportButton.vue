<script setup lang="ts">
import { ref, watch } from "vue";
import { useDataPackageStore } from "@/stores/dataPackage";

const dataPackageStore = useDataPackageStore();

const menuIsVisible = ref(false);
const encodedData = ref("");
const importErrors = ref<string[]>([]);
const showCheckMark = ref(false);

/**
 * Import data from the encoded string
 */
async function importData() {
  importErrors.value = [];
  try {
    if (encodedData.value.includes("data=")) {
      encodedData.value = encodedData.value.split("data=")[1];
    }

    dataPackageStore.importFromEncodedString(encodedData.value);

    if (dataPackageStore.importErrors.length) {
      importErrors.value = [...dataPackageStore.importErrors];
      return;
    }

    // animate the check mark
    await animateCheckMark();
    menuIsVisible.value = false;
  } catch (e) {
    importErrors.value.push("Invalid Data Package; unable to parse data.");
    console.error(e);
    return;
  }
}

/** Animate the check mark */
async function animateCheckMark() {
  showCheckMark.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  showCheckMark.value = false;
}

watch(menuIsVisible, (newVal) => {
  // clear inputs on close
  if (!newVal) {
    encodedData.value = "";
    importErrors.value = [];
  }
});
</script>

<template>
  <v-btn variant="text" icon>
    <v-icon>mdi-import</v-icon>

    <v-tooltip activator="parent" location="top">Import Data</v-tooltip>

    <v-menu v-model="menuIsVisible" activator="parent" :close-on-content-click="false">
      <v-card min-width="250px">
        <v-card-title>Import Data</v-card-title>
        <v-card-text>
          <v-text-field v-model="encodedData" :error-messages="importErrors" label="Encoded Data" variant="outlined" />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="menuIsVisible = false">Cancel</v-btn>
          <v-spacer />
          <v-btn @click="importData()" :color="showCheckMark ? 'success' : 'primary'">
            <v-icon v-if="showCheckMark" icon="mdi-check" />
            <template v-else>Import</template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </v-btn>
</template>
