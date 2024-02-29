<script setup lang="ts">
const emit = defineEmits(["scheduleCall", "selfGuided"]);
</script>

<template>
  <v-card flat class="d-flex flex-column align-center" style="gap: 24px">
    <div class="text-h4 text-center">Get a Free Estimate</div>

    <v-card class="w-75 pa-4" color="secondary" @click="emit('selfGuided')">
      <div class="text-h6 text-center">Self Guided Online Estimate</div>
      <div class="text-subtitle-2 text-center text-dimmed">Ballpark Pricing within 10 minutes</div>
    </v-card>

    <v-card class="w-75 pa-4" color="secondary" @click="emit('scheduleCall')">
      <div class="text-h6 text-center">Schedule a Call</div>
      <div class="text-subtitle-2 text-center text-dimmed">Virtual live estimate with a Sod Smith representative</div>
    </v-card>
  </v-card>
</template>

<style scoped>
.text-dimmed {
  opacity: 60%;
}
</style>
