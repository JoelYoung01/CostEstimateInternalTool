<script setup lang="ts">
import { ref } from "vue";
import type { DataPackage } from "@/types";
import StartPage from "./StartPage.vue";
import DrawTool from "./DrawTool.vue";
import CollectContactInfo from "./CollectContactInfo.vue";
import EstimateResult from "./EstimateResult.vue";
import SendVideo from "./SendVideo.vue";
import DonePage from "./DonePage.vue";
import { useDisplay } from "vuetify";
import { provide } from "vue";
import { DataPackageInjectionKey, DefaultDataPackage } from "@/injections";

const { mobile } = useDisplay();

type Stage = "ScheduleCall" | "Start" | "Draw" | "ContactInfo" | "Estimate" | "SendVideo" | "ConfirmPhone" | "Done";
const defaultStage: Stage = "Start";

const emit = defineEmits<{ close: [] }>();
const currentStage = ref<Stage>(defaultStage);

const dataPackage = ref<DataPackage>(DefaultDataPackage);
provide(DataPackageInjectionKey, dataPackage);

const exit = () => {
  currentStage.value = defaultStage;
  emit("close");
};
</script>

<template>
  <v-card :min-width="mobile ? undefined : 600">
    <v-card-title class="d-flex justify-end">
      <v-btn size="small" variant="text" icon="mdi-close" @click="exit" />
    </v-card-title>
    <v-window v-model="currentStage" rounded :touch="{ left: () => null, right: () => null }" class="px-2 pb-lg-8 pb-4">
      <v-window-item value="Start">
        <StartPage @self-guided="currentStage = 'Draw'" @schedule-call="currentStage = 'ScheduleCall'" />
      </v-window-item>

      <v-window-item value="Draw">
        <DrawTool @back="currentStage = 'Start'" @confirm="currentStage = 'ContactInfo'" />
      </v-window-item>

      <v-window-item value="ContactInfo">
        <CollectContactInfo @back="currentStage = 'Draw'" @confirm="currentStage = 'Estimate'" />
      </v-window-item>

      <v-window-item value="Estimate">
        <EstimateResult @back="currentStage = 'ContactInfo'" @continue="currentStage = 'SendVideo'" />
      </v-window-item>

      <v-window-item value="SendVideo">
        <SendVideo @link="currentStage = 'Done'" @skip="currentStage = 'Done'" @back="currentStage = 'Estimate'" />
      </v-window-item>

      <v-window-item value="ConfirmPhone"> <div></div> </v-window-item>

      <v-window-item value="Done">
        <DonePage @back="currentStage = 'SendVideo'" @schedule-call="exit()" />
      </v-window-item>

      <v-window-item value="ScheduleCall">
        <v-card flat class="pa-lg-8 pa-4">
          <div class="text-h5 font-weight-bold text-center mb-2">Schedule a Call</div>
          <div class="text-center text-body-1 pb-lg-8 pb-4">Pretend this takes you to the integrated calendar</div>
          <div class="d-flex mx-n2">
            <v-spacer />
            <v-btn slim variant="text" @click="currentStage = 'Start'">Start Over</v-btn>
          </div>
        </v-card>
      </v-window-item>
    </v-window>
  </v-card>
</template>
