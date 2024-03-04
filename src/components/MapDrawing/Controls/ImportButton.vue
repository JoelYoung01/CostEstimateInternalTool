<script setup lang="ts">
import { inject, ref } from "vue";
import { DataPackageInjectionKey, DefaultDataPackage } from "@/injections";
import type { DataPackage } from "@/types";
import useJwtUtil from "@/composables/useJwtUtil";
import { watch } from "vue";

const jwtService = useJwtUtil();

const dataPackage = inject(DataPackageInjectionKey, ref<DataPackage>(DefaultDataPackage));

const menuIsVisible = ref(false);
const token = ref("");
const importErrors = ref<string[]>([]);

async function importData() {
  importErrors.value = [];
  try {
    const data = await jwtService.fromJwtToken<DataPackage>(token.value);
    const issues = verifyIsDataPackage(data);
    if (typeof issues !== "undefined") {
      console.error(issues);
      importErrors.value.push(...issues);
      return;
    }

    dataPackage.value = data;
  } catch (e) {
    importErrors.value.push("Invalid token");
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

    if (typeof area.polygon !== "object") {
      polygonIssues.push(`Invalid data package; missing or corrupt polygon object in polygon ${area.id}`);
    }

    if (area.type !== "Sod" && area.type !== "Powerwash") {
      polygonIssues.push(`Invalid data package; invalid type in polygon ${area.id} (${area.type})`);
    }
  }

  if (polygonIssues.length) {
    return polygonIssues;
  }
}

watch(menuIsVisible, (newVal) => {
  // clear inputs on close
  if (!newVal) {
    token.value = "";
    importErrors.value = [];
  }
});
</script>

<template>
  <v-btn variant="text" icon>
    <v-icon>mdi-import</v-icon>

    <v-tooltip activator="parent" location="top">Import Data</v-tooltip>

    <v-menu v-model="menuIsVisible" activator="parent" :close-on-content-click="false">
      <v-card>
        <v-card-title>Import Data</v-card-title>
        <v-card-text>
          <v-text-field v-model="token" :error-messages="importErrors" label="Data" variant="outlined" />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="menuIsVisible = false">Cancel</v-btn>
          <v-btn @click="importData()" color="primary">Import</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </v-btn>
</template>
