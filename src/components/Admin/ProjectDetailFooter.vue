<script setup lang="ts">
import { computed, ref } from "vue";
import { useDataPackageStore } from "@/stores/dataPackage";
import { useCostTools, useUtilities } from "@/composables";

const dataPackageStore = useDataPackageStore();
const { getProjectTier, getProjectCost } = useCostTools();
const { formatCurrency } = useUtilities();

const typeRatio = ref(0);

const totalArea = computed(() => dataPackageStore.dataPackage.drawnAreas.reduce((acc, cur) => acc + cur.area, 0) ?? 0);
const kbgArea = computed(() => Math.round(totalArea.value * (typeRatio.value / 100)));
const stArea = computed(() => Math.round(totalArea.value * ((100 - typeRatio.value) / 100)));
const costBreakdown = computed(() => getProjectCost(kbgArea.value, stArea.value) ?? {});
</script>

<template>
  <div class="d-flex justify-center mb-4">
    <v-chip class="mx-2"> {{ getProjectTier(totalArea)?.name ?? "Unknown" }} </v-chip>
    <v-chip class="mx-2">
      KBG: {{ kbgArea.toLocaleString() }} ft²
      <span v-if="costBreakdown.kbgCost > 0" class="ms-1">({{ formatCurrency(costBreakdown.kbgCost) }})</span>
    </v-chip>
    <v-chip class="mx-2">
      ST: {{ stArea.toLocaleString() }} ft²
      <span v-if="costBreakdown.stCost > 0" class="ms-1">({{ formatCurrency(costBreakdown.stCost) }})</span>
    </v-chip>
    <v-chip v-if="costBreakdown.totalCost > 0" class="mx-2">
      Total Cost: {{ formatCurrency(costBreakdown.totalCost) }}
    </v-chip>
  </div>
  <div class="font-weight-bold">Grass Type Ratio</div>
  <div class="d-flex justify-center">
    <v-slider
      v-model="typeRatio"
      thumb-label="always"
      thumb-size="24"
      label="Grass Type Ratio"
      track-color="secondary"
      class="mx-2"
    >
      <template #label>
        <v-badge color="primary" class="ms-1 me-3" />
        {{ Math.round(100 - typeRatio) }}% Kentucky Blue Grass
        <v-badge color="secondary" class="ms-6 me-3" />
        {{ Math.round(typeRatio) }}% St. Augustine
      </template>
      <template #thumb-label>
        <div>{{ Math.round(typeRatio) }}%</div>
      </template>
    </v-slider>
  </div>
</template>
