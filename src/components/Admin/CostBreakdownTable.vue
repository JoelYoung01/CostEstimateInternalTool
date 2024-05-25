<script setup lang="ts">
import { useCostTools, useUtilities } from "@/composables";

const { tierList } = useCostTools();
const { formatCurrency } = useUtilities();

const tableData = tierList.filter((t) => t.tier !== null);

function getMinSqFt(tier: number) {
  const tierIndex = tierList.findIndex((t) => t.tier === tier);
  return tierList[tierIndex - 1]?.maxSqFt + 1 ?? 0;
}
</script>

<template>
  <v-table>
    <thead>
      <tr>
        <th>Tier</th>
        <th>SqFt Range</th>
        <th>KBG Cost (ft²)</th>
        <th>ST Cost (ft²)</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="tier in tableData" :key="tier.name">
        <td>{{ tier.name }}</td>
        <td>{{ getMinSqFt(tier.tier ?? 0).toLocaleString() }} - {{ tier.maxSqFt.toLocaleString() }}</td>
        <td>{{ formatCurrency(tier.kbgCost ?? 0) }}</td>
        <td>{{ formatCurrency(tier.stCost ?? 0) }}</td>
      </tr>
    </tbody>
  </v-table>
</template>
