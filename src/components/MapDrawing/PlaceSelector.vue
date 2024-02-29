<script setup lang="ts">
import { watch } from "vue";
import { ref } from "vue";

interface Props {
  disabled?: boolean;
}

interface PlaceSelectItem {
  title: string;
  placeObject: google.maps.places.AutocompletePrediction;
}

defineProps<Props>();

defineEmits<{
  "place-selected": [placeId: string | undefined];
}>();

let autocompleteService: google.maps.places.AutocompleteService;
const loadingApi = ref(true);
const apiLoadError = ref<string>();
const searchText = ref<string>();
const loadingResults = ref(false);
const searchResults = ref<PlaceSelectItem[]>([]);
let timerId: number | undefined;

const loadResults = async (query: string) => {
  loadingResults.value = true;
  try {
    const response = await autocompleteService.getPlacePredictions({ input: query });

    if (!response || response.predictions.length === 0) {
      searchResults.value = [];
      return;
    }

    searchResults.value = response.predictions.map((p) => ({
      title: p.description,
      placeObject: p
    }));
  } catch (er) {
    console.error(er);
  }
  loadingResults.value = false;
};

const loadResultsDebounced = (query: string) => {
  // cancel pending call
  clearTimeout(timerId);

  // delay new call 500ms (use `window.` to avoid type conflicts with NodeJS setTimeout)
  timerId = window.setTimeout(() => {
    loadResults(query);
  }, 1000);
};

watch(searchText, async (newVal) => {
  if (!newVal) {
    searchResults.value = [];
    return;
  }

  loadResultsDebounced(newVal);
});

const initSearchService = async () => {
  if (!import.meta.env.VITE_GOOGLE_API_KEY) {
    apiLoadError.value = "Unable to load place selector: missing Google Maps Key.";
    console.error(apiLoadError.value);
    return;
  }

  loadingApi.value = true;
  let retryCount = 0;
  try {
    while (typeof google === "undefined" || !google?.maps?.places) {
      if (retryCount++ > 20) {
        // Waited 10 seconds
        throw new Error("Timed out waiting for Google Maps API to load.");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    autocompleteService = new google.maps.places.AutocompleteService();
  } catch (er) {
    console.error("Unable to load search service:", er);
  }
  loadingApi.value = false;
};

initSearchService();
</script>

<template>
  <v-autocomplete
    v-model:search="searchText"
    :disabled="disabled || !!apiLoadError"
    :items="searchResults"
    :loading="loadingResults"
    style="min-width: 250px"
    placeholder="Jump to a location..."
    prepend-inner-icon="mdi-magnify"
    variant="solo"
    no-data-text="Start typing to find places"
    auto-select-first
    return-object
    clearable
    @update:model-value="$emit('place-selected', $event?.placeObject?.place_id)"
  />
</template>
