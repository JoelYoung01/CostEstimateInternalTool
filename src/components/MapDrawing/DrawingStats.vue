<script setup lang="ts">
import { useDataPackageStore } from "@/stores/dataPackage";

const dataPackageStore = useDataPackageStore();
</script>

<template>
  <v-scale-transition>
    <v-card style="max-width: 300px">
      <v-card-title>Drawn Stats</v-card-title>

      <v-expansion-panels>
        <v-expansion-panel v-for="area in dataPackageStore.dataPackage.drawnAreas" :key="area.area">
          <v-expansion-panel-title>
            {{ area.id }}: {{ area.type ?? "Sod" }} - {{ Math.round(area.area).toLocaleString() }} SQFT
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-container>
              <v-row dense>
                <v-col cols="6" md="6"> Area </v-col>
                <v-col cols="6" md="6"> {{ Math.round(area.area).toLocaleString() }} SQFT </v-col>
                <v-col cols="6" md="6"> Comments </v-col>
                <v-col cols="6" md="6">
                  <template v-if="area.comments">{{ area.comments }}</template>
                  <span v-else class="font-italic">None</span>
                </v-col>
                <v-col cols="6" md="6"> Fenced in Yard? </v-col>
                <v-col cols="6" md="6">
                  {{ area.fencedInYard ? "Yes" : "No" }}
                </v-col>
                <v-col cols="6" md="6"> Accessible From Street? </v-col>
                <v-col cols="6" md="6">
                  {{ area.accessibleFromStreet ? "Yes" : "No" }}
                </v-col>
                <v-col cols="6" md="6"> Stairs to access? </v-col>
                <v-col cols="6" md="6">
                  {{ area.stairsToAccess ? "Yes" : "No" }}
                </v-col>
              </v-row>
            </v-container>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>
  </v-scale-transition>
</template>

<style scoped>
.v-window.v-stepper-window {
  margin: 0;
}
</style>
