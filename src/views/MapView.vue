<script setup lang="ts">
import ProjectDetailFooter from "@/components/Admin/ProjectDetailFooter.vue";
import MapWidgetRoot from "@/components/MapDrawing/MapWidgetRoot.vue";
</script>

<template>
  <v-main>
    <v-container flat class="px-lg-10 px-4">
      <MapWidgetRoot class="mb-2" />
      <ProjectDetailFooter />
    </v-container>
  </v-main>
</template>
