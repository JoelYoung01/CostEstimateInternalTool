<script setup lang="ts">
import { useDataPackageStore } from "@/stores/dataPackage";
import GetComment from "../GetComment.vue";
import { ref } from "vue";
import type { DrawnArea } from "@/types";

const dataPackageStore = useDataPackageStore();

const commentGetter = ref<InstanceType<typeof GetComment>>();

const updateData = async (area: DrawnArea) => {
  const updateIndex = dataPackageStore.dataPackage.drawnAreas.findIndex((a) => a.id === area.id);

  if (updateIndex === -1) {
    return;
  }

  const { comments, fencedInYard, accessibleFromStreet, stairsToAccess, location } =
    await commentGetter.value!.getComment({
      comments: area.comments,
      fencedInYard: area.fencedInYard ?? false,
      accessibleFromStreet: area.accessibleFromStreet ?? false,
      stairsToAccess: area.stairsToAccess ?? false,
      location: area.location
    });

  dataPackageStore.dataPackage.drawnAreas[updateIndex] = {
    ...area,
    comments,
    fencedInYard,
    accessibleFromStreet,
    stairsToAccess,
    location
  };
};
</script>

<template>
  <v-scale-transition>
    <v-card style="max-width: 300px">
      <GetComment ref="commentGetter" />
      <v-card-title>Drawn Stats</v-card-title>

      <v-expansion-panels>
        <v-expansion-panel v-for="area in dataPackageStore.dataPackage.drawnAreas" :key="area.area">
          <v-expansion-panel-title>
            <span>{{ area.id }}: {{ area.type ?? "Sod" }} - {{ Math.round(area.area).toLocaleString() }} SQFT</span>
            <v-spacer />
            <v-btn icon variant="text" size="small" @click.stop="updateData(area)">
              <v-icon icon="mdi-pencil" />
            </v-btn>
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

                <v-col cols="6" md="6"> Sodding Location{{ area.location?.length !== 1 ? "s" : "" }} </v-col>
                <v-col cols="6" md="6">
                  {{ area.location?.join(", ") }}
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
