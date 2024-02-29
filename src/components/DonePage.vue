<script setup lang="ts">
const emit = defineEmits<{ back: []; scheduleCall: [] }>();
</script>

<template>
  <v-card flat max-width="600" class="px-lg-8 px-4">
    <div class="text-center text-h3 font-weight-bold">Hooray! 🎉</div>
    <div class="text-center text-h6 text-dimmed pb-lg-6 pb-4">Thank you for using our online estimation tool!</div>

    <div class="text-center text-body-1 pb-lg-8 pb-4">
      To confirm the price, please schedule a phone call with a Sod Smith representative by clicking the link below.
      This call typically takes 5 - 7 minutes and then you'll have a confirmed price.
      <br />
      <br />
      We look forward to hearing from you!
    </div>

    <div class="d-flex mx-n2">
      <v-btn slim variant="text" @click="emit('back')">Back</v-btn>
      <v-spacer />
      <v-btn variant="flat" class="px-4" color="primary" rounded @click="emit('scheduleCall')">Done</v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.text-dimmed {
  opacity: 60%;
}
</style>
