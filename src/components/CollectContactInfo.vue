<script setup lang="ts">
import { ref } from "vue";
import { useDisplay } from "vuetify";
import { inject } from "vue";
import { DataPackageInjectionKey, DefaultDataPackage } from "@/injections";
import { useUtilities } from "@/composables";

// Hide the completion date picker for now, until we integrate with the heatmap calendar idea
const showCompletionDatePicker = false;

const emit = defineEmits<{
  confirm: [];
  back: [];
}>();

const dataPackage = inject(DataPackageInjectionKey, ref(DefaultDataPackage));

const { mobile } = useDisplay();

const validForm = ref(false);
const showDatePicker = ref(false);

const required = (value: string) => !!value || "Required";
const isEmail = (value: string) => /.+@.+\..+/.test(value) || "Invalid email";

const { daysFromToday } = useUtilities();
</script>

<template>
  <v-card flat class="px-lg-8 px-4" max-width="600">
    <div class="text-h5 text-center font-weight-bold mb-2">
      {{ mobile ? "Enter a few more details" : "We need a few more details from you to calculate your estimate" }}
    </div>

    <v-form v-model="validForm">
      <v-text-field
        v-model="dataPackage.name"
        prepend-icon="mdi-account"
        label="Name"
        variant="outlined"
        class="mb-3"
        :rules="[required]"
      />
      <v-text-field
        v-model="dataPackage.email"
        prepend-icon="mdi-email"
        validate-on="blur"
        label="Email"
        placeholder="johndoe@gmail.com"
        variant="outlined"
        class="mb-3"
        :rules="[required, isEmail]"
      />
      <v-text-field
        v-model="dataPackage.phone"
        prepend-icon="mdi-phone"
        label="Phone"
        variant="outlined"
        class="mb-3"
        :rules="[required]"
      />
      <v-text-field
        v-if="showCompletionDatePicker"
        :modelValue="dataPackage.desiredCompleteDate.toDateString()"
        readonly
        prepend-icon="mdi-calendar-month-outline"
        label="Desired Completion Date"
        variant="outlined"
        class="mb-3"
        :rules="[required]"
      >
        <v-menu v-model="showDatePicker" activator="parent" :close-on-content-click="false">
          <v-date-picker
            v-model="dataPackage.desiredCompleteDate"
            :min="new Date()"
            landscape
            @update:modelValue="showDatePicker = false"
          />
        </v-menu>

        <template #append-inner>
          <span style="font-size: 12px; white-space: nowrap">
            In {{ daysFromToday(dataPackage.desiredCompleteDate) }} day{{
              daysFromToday(dataPackage.desiredCompleteDate) === 1 ? "" : "s"
            }}
          </span>
        </template>
      </v-text-field>
    </v-form>

    <div class="d-flex mx-n2">
      <v-btn slim variant="text" @click="emit('back')"> Back </v-btn>
      <v-spacer />
      <v-btn slim variant="flat" color="primary" class="px-4" rounded @click="emit('confirm')" :disabled="!validForm">
        Confirm
      </v-btn>
    </div>
  </v-card>
</template>
