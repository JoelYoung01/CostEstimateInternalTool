<script setup lang="ts">
import ImportButton from "./Controls/ImportButton.vue";

defineProps<{
  totalArea: number;
  disabledClearAll: boolean;
}>();

const emit = defineEmits<{
  "clear-all-polygons": [];
  "center-on-user": [];
}>();
</script>

<template>
  <v-card class="d-flex align-center pl-3" style="font-size: 1rem">
    <div>Total Area:</div>
    <div>
      <v-chip class="mx-2">{{ Math.max(0, Math.round(totalArea)).toLocaleString() }}</v-chip>
    </div>
    <div class="mr-3">SQFT</div>

    <v-btn variant="text" icon @click="emit('center-on-user')">
      <v-icon icon="mdi-crosshairs-gps" />
      <v-tooltip activator="parent" location="top"> Center map on me </v-tooltip>
    </v-btn>

    <v-btn :disabled="disabledClearAll" variant="text" icon @click="emit('clear-all-polygons')">
      <v-icon icon="mdi-layers-remove" />
      <v-tooltip activator="parent" location="top"> Clear all areas </v-tooltip>
    </v-btn>

    <!-- Import -->
    <import-button />
  </v-card>
</template>
