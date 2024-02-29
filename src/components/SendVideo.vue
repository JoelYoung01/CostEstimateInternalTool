<script setup lang="ts">
import exampleImage from "@/assets/images/TakeVideoExampleImage.png";
import { useDisplay } from "vuetify";

const emit = defineEmits<{ link: [string]; skip: []; back: [] }>();

// const exampleImage = new URL("@/assets/images/TakeVideoExampleImage.png", import.meta.url).href;

const buildLink = () => {
  const link = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  emit("link", link);
  window.open(link, "_blank");
};

const { mobile } = useDisplay();
</script>

<template>
  <v-card flat class="px-lg-8 px-4">
    <div class="text-center text-h5 font-weight-bold mb-2">Send us your Project Video in one click</div>
    <v-img :height="mobile ? 200 : 400" :src="exampleImage" class="mb-4">
      <template #placeholder>
        <div class="h-100 d-flex justify-center align-center">
          <v-icon size="200" icon="mdi-tooltip-cellphone" />
        </div>
      </template>
    </v-img>

    <div class="d-flex justify-center mb-6">
      <v-btn size="x-large" rounded variant="elevated" class="mx-auto" color="primary" @click="buildLink()">
        Get Link
      </v-btn>
    </div>

    <div class="d-flex mx-n2">
      <v-btn slim variant="text" @click="emit('back')">Back</v-btn>
      <v-spacer />
      <v-btn slim variant="text" @click="emit('skip')">Skip for now</v-btn>
    </div>
  </v-card>
</template>
