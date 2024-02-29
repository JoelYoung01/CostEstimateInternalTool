<script setup lang="ts">
import { watch } from "vue";
import { ref } from "vue";

interface SubmitPayload {
  comments?: string;
  fencedInYard: boolean;
  accessibleFromStreet: boolean;
  stairsToAccess: boolean;
}

const showDialog = ref(false);
const comments = ref<string>();
const fencedInYard = ref(false);
const accessibleFromStreet = ref(false);
const stairsToAccess = ref(false);

const eventTarget = new EventTarget();

function reset() {
  comments.value = undefined;
  fencedInYard.value = false;
  accessibleFromStreet.value = false;
  stairsToAccess.value = false;
}

async function getComment() {
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
      stairsToAccess: stairsToAccess.value
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
    <v-card>
      <div class="text-subtitle-1 px-6 pt-3">Add some details about this area</div>
      <div class="px-6">
        <v-checkbox v-model="fencedInYard" hide-details density="compact" label="Fenced in yard?" />
        <v-checkbox v-model="accessibleFromStreet" hide-details density="compact" label="Accessible from street?" />
        <v-checkbox v-model="stairsToAccess" hide-details density="compact" label="Stairs to access?" />
        <v-textarea v-model="comments" label="Comment (Optional)" />
      </div>
      <v-card-actions class="mb-3">
        <v-spacer />
        <v-btn variant="flat" color="primary" class="px-4" rounded @click="showDialog = false">Submit</v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
