<script setup lang="ts">
import { inject, ref, watch } from "vue";
import { DataPackageInjectionKey, DefaultDataPackage } from "@/injections";
import type { DataPackage } from "@/types";

const dataPackage = inject(DataPackageInjectionKey, ref<DataPackage>(DefaultDataPackage));

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
    // decode the data
    const data = JSON.parse(atob(encodedData.value));

    // verify the data
    const issues = verifyIsDataPackage(data);

    // if there are issues, log them and return
    if (typeof issues !== "undefined") {
      console.error(issues);
      importErrors.value.push(...issues);
      return;
    }

    // set the data
    dataPackage.value = data;

    // animate the check mark
    await animateCheckMark();
    menuIsVisible.value = false;
  } catch (e) {
    importErrors.value.push("Invalid Data Package; unable to parse data.");
    console.error(e);
    return;
  }
}

/**
 * Verify that the data is a valid data package
 *
 * @param data Data to verify
 *
 * @returns `undefined` if the data is valid, otherwise a string describing the error
 */
function verifyIsDataPackage(data: any): undefined | string[] {
  if (!data) {
    return ["Invalid data package; missing data"];
  }

  if (!Array.isArray(data.drawnAreas) || !data.drawnAreas.length) {
    return ["Invalid data package; missing or corrupt drawnAreas"];
  }

  const polygonIssues: string[] = [];
  for (const area of data.drawnAreas) {
    if (typeof area.id !== "number") {
      polygonIssues.push(`Invalid data package; missing or corrupt id in polygon ${area.id}`);
    }

    if (typeof area.area !== "number") {
      polygonIssues.push(`Invalid data package; missing or corrupt area in polygon ${area.id}`);
    }

    if (!Array.isArray(area.paths) || !area.paths.length) {
      polygonIssues.push(`Invalid data package; missing or corrupt polygon object in polygon ${area.id}`);
    } else {
      for (const path of area.paths) {
        if (!Array.isArray(path) || !path.length) {
          polygonIssues.push(`Invalid data package; missing or corrupt path in polygon ${area.id}`);
        } else {
          for (const latLng of path) {
            if (typeof latLng.lat !== "number" || typeof latLng.lng !== "number") {
              polygonIssues.push(`Invalid data package; missing or corrupt lat/lng in polygon ${area.id}`);
            }
          }
        }
      }
    }

    if (area.type !== "Sod" && area.type !== "Powerwash") {
      polygonIssues.push(`Invalid data package; invalid type in polygon ${area.id} (${area.type})`);
    }
  }

  if (polygonIssues.length) {
    return polygonIssues;
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
