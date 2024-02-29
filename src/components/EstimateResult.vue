<script setup lang="ts">
import { useUtilities } from "@/composables";
import { DataPackageInjectionKey, DefaultDataPackage } from "@/injections";
import { computed, inject, ref } from "vue";
import { useDisplay } from "vuetify";

const emit = defineEmits<{
  continue: [];
  back: [];
}>();

const { mobile } = useDisplay();
const { daysFromToday } = useUtilities();

const dataPackage = inject(DataPackageInjectionKey, ref(DefaultDataPackage));

const totalArea = computed(() => {
  return dataPackage.value.drawnAreas.reduce((acc, cur) => acc + cur.area, 0) ?? 0;
});

const pricePerSquareFoot = 3.5;
const pricePerFastDay = 10;
const fenceFee = 100;
const inaccessibleFee = 100;
const stairsFee = 100;

const estimate = computed(() => {
  const basePrice = totalArea.value * pricePerSquareFoot;
  const fees = dataPackage.value.drawnAreas.reduce((acc, cur) => {
    if (cur.fencedInYard) acc += fenceFee;
    if (!cur.accessibleFromStreet) acc += inaccessibleFee;
    if (cur.stairsToAccess) acc += stairsFee;
    return acc;
  }, 0);

  const basePriceWithFees = basePrice + fees;
  const daysPrice = Math.min(30 - daysFromToday(dataPackage.value.desiredCompleteDate), 0) * pricePerFastDay;
  return Math.round((basePriceWithFees + daysPrice) / 100) * 100 + 150;
});
</script>

<template>
  <v-card flat max-width="600px" class="px-lg-6 px-4">
    <div class="text-h5 text-center mb-2 font-weight-bold">
      Ballpark Range for {{ Math.ceil(totalArea).toLocaleString() }} SQFT:
    </div>
    <v-card-text class="d-flex align-center justify-center" :style="{ gap: mobile ? '12px' : '24px' }">
      <v-chip size="x-large" variant="elevated" color="secondary"> ${{ (estimate - 150).toLocaleString() }} </v-chip>
      <v-icon icon="mdi-arrow-left-right" size="x-large" />
      <v-chip size="x-large" variant="elevated" color="secondary"> ${{ (estimate + 150).toLocaleString() }} </v-chip>
    </v-card-text>

    <div class="text-center text-body-1 mb-6">
      If the range above is within your budget, continue to get your personalized quote!
    </div>

    <div class="d-flex mx-n2">
      <v-btn slim variant="text" @click="emit('back')">Back</v-btn>
      <v-spacer />
      <v-btn slim variant="flat" color="primary" class="px-4" rounded @click="emit('continue')">Continue</v-btn>
    </div>
  </v-card>
</template>
