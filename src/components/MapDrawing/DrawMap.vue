<script setup lang="ts">
/// <reference types="google.maps" />
import { ref, onMounted, onBeforeUnmount, toRaw, computed, reactive } from "vue";
import { CustomControl, GoogleMap, Marker } from "vue3-google-map";
import GetComment from "../GetComment.vue";
import DrawingManager from "./DrawingManager.vue";
import PlaceSelector from "./PlaceSelector.vue";
import CompassControl from "./CompassControl.vue";
import type { DrawnArea } from "@/types";
import { useTheme } from "vuetify";
import DrawingStats from "./DrawingStats.vue";
import { useDataPackageStore } from "@/stores/dataPackage";
import { useRoute, useRouter } from "vue-router";

interface Props {
  error?: string;
}
defineProps<Props>();

const { current: currentTheme } = useTheme();
const route = useRoute();
const router = useRouter();

const sodSmith: google.maps.LatLngLiteral = { lat: 44.886297901877114, lng: -93.30808521796632 };

const basePolygonConfig: google.maps.PolygonOptions = {
  clickable: true,
  editable: true,
  draggable: false,
  fillColor: currentTheme.value.colors.secondary,
  strokeColor: "black",
  fillOpacity: 0.33,
  geodesic: false,
  strokeOpacity: 1,
  strokePosition: 0,
  strokeWeight: 3,
  visible: true,
  zIndex: 1
};

const zoom = ref(17);
const mapRef = ref<InstanceType<typeof GoogleMap>>();
const commentGetter = ref<InstanceType<typeof GetComment>>();
const polygons = ref<(google.maps.Polygon | undefined)[]>([]);
const selectedMode = ref<"cursor" | "draw">("draw");
const showLocationMarker = ref(true);
const locationMarkerPos = ref<google.maps.LatLngLiteral>();

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

const drawingManager = ref<google.maps.drawing.DrawingManager>();
const dataPackageStore = useDataPackageStore();

const totalArea = computed(() => {
  return dataPackageStore.dataPackage.drawnAreas.reduce((acc, cur) => acc + cur.area, 0) ?? 0;
});
const polygonCount = computed(() => {
  return dataPackageStore.dataPackage.drawnAreas.length ?? 0;
});

const polygonMarkers = computed(() => {
  return dataPackageStore.dataPackage.drawnAreas.map((area) => {
    const bounds = new google.maps.LatLngBounds();
    area.paths[0].forEach((point) => {
      bounds.extend(point);
    });
    const center = bounds.getCenter();

    return {
      position: center,
      label: area.id.toString()
    };
  });
});
const allMarkers = computed(() => {
  const allMarkers = [...polygonMarkers.value];

  if (showLocationMarker.value && locationMarkerPos.value) {
    allMarkers.push({
      position: new google.maps.LatLng(locationMarkerPos.value),
      label: ""
    });
  }

  return allMarkers;
});

const centerOnUser = () => {
  if (!mapRef.value) return;

  navigator.geolocation.getCurrentPosition((position) => {
    mapRef.value?.map?.setCenter({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });

    // Add a marker at the user's location
    locationMarkerPos.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    showLocationMarker.value = true;
  });
};

const centerOnPlace = (place_id?: string) => {
  if (!place_id || !mapRef.value?.map) return;

  const service = new google.maps.places.PlacesService(mapRef.value.map);
  service.getDetails({ placeId: place_id }, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
      mapRef.value?.map?.setCenter(place.geometry.location);

      // Add a marker at the place
      locationMarkerPos.value = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      showLocationMarker.value = true;
    }
  });
};

/**
 * Get paths from a polygon
 * @param polygon Polygon to get paths from
 */
const pathsFromPolygon = (polygon: google.maps.Polygon) => {
  return polygon
    .getPaths()
    .getArray()
    .map((path) => path.getArray().map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() })));
};

/**
 * Load polygons from the data package (resets all polygons)
 */
const loadPolygonsFromDataPackage = () => {
  const maxPolygonId = dataPackageStore.dataPackage.drawnAreas.reduce((acc, cur) => Math.max(acc, cur.id), 0);
  polygons.value.forEach((p) => {
    toRaw(p)?.setMap(null);
  });
  polygons.value = [];
  polygons.value.fill(undefined, 0, maxPolygonId + 1);

  dataPackageStore.dataPackage.drawnAreas.forEach((area) => {
    const newPolygon = new google.maps.Polygon({
      paths: area.paths[0]?.map((path) => new google.maps.LatLng(path.lat, path.lng)),
      ...basePolygonConfig
    });

    newPolygon.setMap(mapRef.value?.map ?? null);

    newPolygon.addListener("contextmenu", () => {
      removePolygon(area.id);
    });

    newPolygon.addListener("dblclick", () => {
      removePolygon(area.id);
    });

    newPolygon.addListener("mouseup", (polyEvent: google.maps.PolyMouseEvent) => {
      if (typeof polyEvent.edge !== "undefined" || typeof polyEvent.vertex !== "undefined") {
        area.area = google.maps.geometry.spherical.computeArea(newPolygon.getPath(), 2.093e7);
        area.paths = pathsFromPolygon(newPolygon);
      }
    });

    polygons.value[area.id] = newPolygon;
  });
};

/**
 * Handle a new polygon being created
 * @param newPolygon New polygon being created
 */
const handleNewPolygon = async (newPolygon: google.maps.Polygon) => {
  if (typeof commentGetter.value === "undefined") newPolygon.setMap(null);

  const { comments, fencedInYard, accessibleFromStreet, stairsToAccess, location } =
    await commentGetter.value!.getComment();

  const polygonId = Math.max(polygons.value.length, 1);

  const newDrawnArea = reactive<DrawnArea>({
    id: polygonId,
    paths: pathsFromPolygon(newPolygon),
    area: google.maps.geometry.spherical.computeArea(newPolygon.getPath(), 2.093e7),
    type: "Sod",
    comments,
    fencedInYard,
    accessibleFromStreet,
    stairsToAccess,
    location
  });

  newPolygon.addListener("contextmenu", () => {
    removePolygon(polygonId);
  });

  newPolygon.addListener("dblclick", () => {
    removePolygon(polygonId);
  });

  newPolygon.addListener("mouseup", (polyEvent: google.maps.PolyMouseEvent) => {
    if (typeof polyEvent.edge !== "undefined" || typeof polyEvent.vertex !== "undefined") {
      newDrawnArea.area = google.maps.geometry.spherical.computeArea(newPolygon.getPath(), 2.093e7);
      newDrawnArea.paths = pathsFromPolygon(newPolygon);
    }
  });

  polygons.value[polygonId] = newPolygon;
  dataPackageStore.dataPackage.drawnAreas.push(newDrawnArea);
  setMode("cursor");
};

/**
 * Remove a polygon from the map
 * @param id id of the polygon to remove
 */
const removePolygon = (id: number) => {
  const polygon = polygons.value[id];
  if (typeof polygon === "undefined") return;

  toRaw(polygon).setMap(null);
  dataPackageStore.dataPackage.drawnAreas = dataPackageStore.dataPackage.drawnAreas.filter((p) => p.id !== id);
};

/**
 * Clear all polygons from the map
 */
const clearAllPolygons = () => {
  dataPackageStore.dataPackage.drawnAreas = [];
  polygons.value.forEach((p) => typeof p === "undefined" || toRaw(p).setMap(null));
  polygons.value = [];

  locationMarkerPos.value = undefined;
  showLocationMarker.value = false;
};

/**
 * Update the center of the map in the data package
 */
const onCenterChange = (newCenter?: { lat: number; lng: number }) => {
  const currentCenter = mapRef.value?.map?.getCenter();

  if (!currentCenter && !newCenter) return;

  dataPackageStore.dataPackage.mapCenter = {
    lat: newCenter?.lat ?? currentCenter?.lat() ?? sodSmith.lat,
    lng: newCenter?.lng ?? currentCenter?.lng() ?? sodSmith.lng
  };
};

/*
 * Update the zoom of the map in the data package
 */
const onZoomChange = (newZoom?: number) => {
  const currentZoom = mapRef.value?.map?.getZoom();

  if (typeof currentZoom === "undefined" && typeof newZoom === "undefined") return;

  dataPackageStore.dataPackage.mapZoom = currentZoom ?? newZoom ?? 17;
};

const onDataImport = () => {
  loadPolygonsFromDataPackage();
  mapRef.value?.map?.setCenter(dataPackageStore.dataPackage.mapCenter ?? sodSmith);
  mapRef.value?.map?.setZoom(dataPackageStore.dataPackage.mapZoom ?? 17);
};

/**
 * Initialize the map
 */
const initMap = async () => {
  if (drawingManager.value) return;

  // Wait for maps api to be loaded
  while (!mapRef.value?.ready || !mapRef.value?.map || !google?.maps?.drawing) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const drawOptions: google.maps.drawing.DrawingManagerOptions = {
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: false,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [google.maps.drawing.OverlayType.POLYGON]
    },
    polygonOptions: { ...basePolygonConfig }
  };

  drawingManager.value = new google.maps.drawing.DrawingManager(drawOptions);

  google.maps.event.addListener(drawingManager.value, "polygoncomplete", handleNewPolygon);
  mapRef.value.map.addListener("bounds_changed", onCenterChange);
  mapRef.value.map.addListener("zoom_changed", onZoomChange);

  drawingManager.value.setMap(mapRef.value.map);

  // Attempt to pull the data from the route
  if (typeof route.query.data !== "undefined") {
    // If there was data, import it
    dataPackageStore.importFromEncodedString(route.query.data as string);

    // Clear the 'data' query param from the route
    router.replace({ query: { ...route.query, data: undefined } });
  }
};

/**
 * Set the mode of the drawing manager
 * @param mode The mode to update to
 */
function setMode(mode: "cursor" | "draw") {
  if (!drawingManager.value) return;

  if (mode === "cursor") {
    drawingManager.value.setDrawingMode(null);
  } else {
    drawingManager.value.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
  }

  selectedMode.value = mode;
}

onMounted(() => {
  dataPackageStore.eventTarget.addEventListener("imported", onDataImport);
  initMap();
});

onBeforeUnmount(() => {
  if (drawingManager.value) {
    clearAllPolygons();

    drawingManager.value.setMap(null);
    drawingManager.value = undefined;
  }

  dataPackageStore.eventTarget.removeEventListener("imported", onDataImport);
});
</script>

<template>
  <GetComment ref="commentGetter" />
  <GoogleMap
    ref="mapRef"
    style="height: calc(100vh - 200px); width: 100%"
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
    <Marker v-for="marker in allMarkers" :key="marker.label" :options="marker" />

    <CustomControl position="TOP_CENTER" class="ma-1">
      <PlaceSelector :disabled="!!error" @place-selected="centerOnPlace" />
    </CustomControl>

    <CustomControl position="TOP_RIGHT" class="ma-1">
      <v-btn v-if="selectedMode === 'draw'" :disabled="polygonMarkers.length === 0" @click="setMode('cursor')">
        Cancel
      </v-btn>
      <v-btn v-else-if="selectedMode === 'cursor'" color="secondary" @click="setMode('draw')">
        <v-icon start>mdi-pencil</v-icon>
        Draw {{ polygonMarkers.length > 0 ? "another" : "an" }} Area
      </v-btn>
    </CustomControl>

    <CustomControl position="RIGHT_CENTER" class="d-flex flex-column ma-1">
      <v-btn size="small" icon="mdi-plus" :disabled="zoom >= 21" @click="zoom++" class="rounded-t-lg rounded-b-0" />
      <v-btn size="small" icon="mdi-minus" :disabled="zoom <= 16" @click="zoom--" class="rounded-b-lg rounded-t-0" />
    </CustomControl>

    <CustomControl position="BOTTOM_CENTER" class="ma-1">
      <DrawingManager
        :total-area="totalArea"
        :disabled-clear-all="polygonCount === 0 && !locationMarkerPos"
        @center-on-user="centerOnUser()"
        @clear-all-polygons="clearAllPolygons()"
      />
    </CustomControl>

    <CustomControl position="RIGHT_BOTTOM" class="ma-1">
      <CompassControl :angle="0" />
    </CustomControl>

    <CustomControl position="LEFT_TOP" class="ma-1">
      <DrawingStats />
    </CustomControl>
  </GoogleMap>
</template>
