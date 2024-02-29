<script setup lang="ts">
/// <reference types="google.maps" />
import { ref, onMounted, onBeforeUnmount, toRaw, inject, computed } from "vue";
import { CustomControl, GoogleMap } from "vue3-google-map";
import GetComment from "../GetComment.vue";
import DrawingManager from "./DrawingManager.vue";
import PlaceSelector from "./PlaceSelector.vue";
import CompassControl from "./CompassControl.vue";
import DrawingGuide from "./DrawingGuide.vue";
import type { DataPackage, DrawnArea } from "@/types";
import { DataPackageInjectionKey, DefaultDataPackage } from "@/injections";
import { useTheme } from "vuetify";

interface Props {
  error?: string;
}
defineProps<Props>();
const { current: currentTheme } = useTheme();

const sodSmith: google.maps.LatLngLiteral = { lat: 44.886297901877114, lng: -93.30808521796632 };

const zoom = ref(17);
const mapRef = ref<InstanceType<typeof GoogleMap>>();
const commentGetter = ref<InstanceType<typeof GetComment>>();
const selectedMode = ref<"cursor" | "draw">("cursor");

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

const drawingManager = ref<google.maps.drawing.DrawingManager>();
const dataPackage = inject(DataPackageInjectionKey, ref<DataPackage>(DefaultDataPackage));

const totalArea = computed(() => {
  return dataPackage.value.drawnAreas.reduce((acc, cur) => acc + cur.area, 0) ?? 0;
});
const polygonCount = computed(() => {
  return dataPackage.value.drawnAreas.length ?? 0;
});

const centerOnUser = () => {
  if (!mapRef.value) return;

  navigator.geolocation.getCurrentPosition((position) => {
    mapRef.value?.map?.setCenter({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
  });
};

const centerOnPlace = (place_id?: string) => {
  if (!place_id || !mapRef.value?.map) return;

  const service = new google.maps.places.PlacesService(mapRef.value.map);
  service.getDetails({ placeId: place_id }, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
      mapRef.value?.map?.setCenter(place.geometry.location);
    }
  });
};

const handleNewPolygon = async (newPolygon: google.maps.Polygon) => {
  if (typeof commentGetter.value === "undefined") removePolygon({ polygon: newPolygon, area: 0 });

  const { comments, fencedInYard, accessibleFromStreet, stairsToAccess } = await commentGetter.value!.getComment();

  const newDrawnArea: DrawnArea = {
    polygon: newPolygon,
    area: google.maps.geometry.spherical.computeArea(newPolygon.getPath(), 2.093e7),
    comments,
    fencedInYard,
    accessibleFromStreet,
    stairsToAccess
  };

  newPolygon.addListener("contextmenu", () => {
    removePolygon(newDrawnArea);
  });

  newPolygon.addListener("dblclick", () => {
    removePolygon(newDrawnArea);
  });

  dataPackage.value.drawnAreas.push(newDrawnArea);
};

const removePolygon = (drawnArea: DrawnArea) => {
  toRaw(drawnArea.polygon).setMap(null);
  dataPackage.value.drawnAreas = dataPackage.value.drawnAreas.filter((p) => p.polygon.getMap() !== null);
};

const clearAllPolygons = () => {
  dataPackage.value.drawnAreas.forEach(removePolygon);
};

const initMap = async () => {
  if (drawingManager.value) return;

  // Wait for maps api to be loaded
  while (!mapRef.value?.ready || !mapRef.value?.map || !google?.maps?.drawing) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const drawOptions: google.maps.drawing.DrawingManagerOptions = {
    drawingMode: undefined,
    drawingControl: false,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [google.maps.drawing.OverlayType.POLYGON]
    },
    polygonOptions: {
      clickable: true,
      editable: true,
      draggable: false,
      fillColor: currentTheme.value.colors.secondary,
      strokeColor: "black",
      fillOpacity: 0.33,
      geodesic: false,
      strokeOpacity: 1,
      strokePosition: google.maps.StrokePosition.CENTER,
      strokeWeight: 3,
      visible: true,
      zIndex: 1
    }
  };

  drawingManager.value = new google.maps.drawing.DrawingManager(drawOptions);

  google.maps.event.addListener(drawingManager.value, "polygoncomplete", handleNewPolygon);

  drawingManager.value.setMap(mapRef.value.map);
};

function setMode(mode: "cursor" | "draw") {
  if (!drawingManager.value) return;

  if (mode === "cursor") {
    drawingManager.value.setDrawingMode(null);
    // dataPackage.value.drawnAreas.forEach((p) => p.polygon.setOptions(editablePolygon));
  } else {
    drawingManager.value.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    // dataPackage.value.drawnAreas.forEach((p) => p.polygon.setOptions(staticPolygon));
  }
}

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (drawingManager.value) {
    clearAllPolygons();

    drawingManager.value.setMap(null);
    drawingManager.value = undefined;
  }
});
</script>

<template>
  <GetComment ref="commentGetter" />
  <GoogleMap
    ref="mapRef"
    style="height: calc(100vh - 200px); width: calc(100vw - 125px)"
    :background-color="$vuetify.theme.current.colors.background"
    :api-key="apiKey"
    :center="sodSmith"
    :zoom="zoom"
    @zoom_changed="zoom = mapRef?.map?.getZoom() ?? 0"
    :min-zoom="16"
    :max-zoom="21"
    :tilt="0"
    :libraries="[]"
    disable-double-click-zoom
    map-type-id="satellite"
    disable-default-ui
    @dblclick.stop
  >
    <CustomControl position="TOP_CENTER" class="ma-1">
      <PlaceSelector :disabled="!!error" @place-selected="centerOnPlace" />
    </CustomControl>

    <CustomControl position="TOP_RIGHT" class="ma-1">
      <v-btn-toggle v-model="selectedMode" mandatory>
        <v-btn
          value="cursor"
          size="small"
          :color="selectedMode === 'cursor' ? 'primary' : 'default'"
          icon="mdi-cursor-pointer"
          @click="setMode('cursor')"
        />
        <v-btn
          :color="selectedMode === 'draw' ? 'primary' : 'default'"
          value="draw"
          size="small"
          icon="mdi-draw"
          @click="setMode('draw')"
        />
      </v-btn-toggle>
    </CustomControl>

    <CustomControl position="RIGHT_CENTER" class="d-flex flex-column ma-1">
      <v-btn size="small" icon="mdi-plus" :disabled="zoom >= 21" @click="zoom++" class="rounded-t-lg rounded-b-0" />
      <v-btn size="small" icon="mdi-minus" :disabled="zoom <= 16" @click="zoom--" class="rounded-b-lg rounded-t-0" />
    </CustomControl>

    <CustomControl position="BOTTOM_CENTER" class="ma-1">
      <DrawingManager
        :total-area="totalArea"
        :disabled-clear-all="polygonCount === 0"
        @center-on-user="centerOnUser()"
        @clear-all-polygons="clearAllPolygons()"
      />
    </CustomControl>

    <CustomControl position="RIGHT_BOTTOM" class="ma-1">
      <CompassControl :angle="0" />
    </CustomControl>

    <CustomControl position="LEFT_TOP" class="ma-1">
      <DrawingGuide />
    </CustomControl>
  </GoogleMap>
</template>
