<script setup lang="ts">
import MapWidgetRoot from "@/components/MapDrawing/MapWidgetRoot.vue";
import ProjectDetailFooter from "@/components/Admin/ProjectDetailFooter.vue";
import CostBreakdownTable from "@/components/Admin/CostBreakdownTable.vue";
</script>

<template>
  <v-main>
    <v-container flat class="px-lg-10 px-4">
      <MapWidgetRoot class="mb-2" />
      <ProjectDetailFooter />
      <CostBreakdownTable />
    </v-container>
  </v-main>
</template>
