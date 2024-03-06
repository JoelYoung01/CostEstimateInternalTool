<script setup lang="ts">
import type { SodLocationType } from "@/types";
import { watch } from "vue";
import { ref } from "vue";

interface SubmitPayload {
  comments?: string;
  location?: SodLocationType[];
  fencedInYard: boolean;
  accessibleFromStreet: boolean;
  stairsToAccess: boolean;
}

const showDialog = ref(false);
const comments = ref<string>();
const fencedInYard = ref(false);
const accessibleFromStreet = ref(false);
const stairsToAccess = ref(false);
const sodLocation = ref<SodLocationType[]>([]);

const eventTarget = new EventTarget();

function reset() {
  comments.value = undefined;
  fencedInYard.value = false;
  accessibleFromStreet.value = false;
  stairsToAccess.value = false;
  sodLocation.value = [];
}

async function getComment(currentValue?: SubmitPayload) {
  if (currentValue) {
    comments.value = currentValue.comments;
    fencedInYard.value = currentValue.fencedInYard;
    accessibleFromStreet.value = currentValue.accessibleFromStreet;
    stairsToAccess.value = currentValue.stairsToAccess;
    sodLocation.value = currentValue.location ?? [];
  }

  showDialog.value = true;

  return await waitForComment(eventTarget, "comment");
}

function waitForComment(eventTarget: EventTarget, eventName: string) {
  return new Promise<SubmitPayload>((resolve) => {
    const listener = (event: any) => {
      eventTarget.removeEventListener(eventName, listener);
      resolve(event.detail);
    };
    eventTarget.addEventListener(eventName, listener);
  });
}

watch(showDialog, (newVal) => {
  if (!newVal) {
    const submitDetail: SubmitPayload = {
      comments: comments.value,
      fencedInYard: fencedInYard.value,
      accessibleFromStreet: accessibleFromStreet.value,
      stairsToAccess: stairsToAccess.value,
      location: sodLocation.value
    };
    eventTarget.dispatchEvent(new CustomEvent("comment", { detail: submitDetail }));
    reset();
  }
});

defineExpose({
  getComment
});
</script>

<template>
  <v-dialog v-model="showDialog" width="auto">
    <v-card class="px-6 py-3">
      <div class="text-subtitle-1">Add some details about this area</div>
      <v-row>
        <v-col cols="6">
          <v-checkbox v-model="fencedInYard" hide-details density="compact" label="Fenced in yard?" />
          <v-checkbox v-model="accessibleFromStreet" hide-details density="compact" label="Accessible from street?" />
          <v-checkbox v-model="stairsToAccess" hide-details density="compact" label="Stairs to access?" />
        </v-col>

        <v-col cols="6">
          <v-checkbox v-model="sodLocation" label="Front Yard" value="Front Yard" density="compact" hide-details />
          <v-checkbox v-model="sodLocation" label="Back Yard" value="Back Yard" density="compact" hide-details />
          <v-checkbox v-model="sodLocation" label="Side Yard" value="Side Yard" density="compact" hide-details />
        </v-col>

        <v-col cols="12">
          <v-textarea v-model="comments" label="Comment (Optional)" />
        </v-col>
      </v-row>
      <div class="d-flex justify-center">
        <v-btn variant="flat" color="primary" class="px-4" rounded @click="showDialog = false">Submit</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
