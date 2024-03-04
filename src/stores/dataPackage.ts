import { ref, type Ref } from "vue";
import { defineStore } from "pinia";
import { useUtilities } from "@/composables";
import type { DataPackage } from "@/types";

interface DataPackageStore {
  /** Data Package containing all the session's data */
  dataPackage: Ref<DataPackage>;

  /** An array of any errors that occurred while importing */
  importErrors: Ref<string[]>;

  /** An array of any errors that occurred while exporting */
  exportErrors: Ref<string[]>;

  /**
   * Event target for the store
   *
   * Events:
   * - `imported` - Dispatched when data is imported
   */
  eventTarget: EventTarget;

  /**
   * Import data from the encoded string
   * @param encodedString Encoded string to import data from
   */
  importFromEncodedString(encodedString: string): void;

  /**
   * Export the data to an encoded string
   */
  exportToEncodedString(): string | undefined;
}

export const useDataPackageStore = defineStore("dataPackage", (): DataPackageStore => {
  const { nextWeek } = useUtilities();

  const dataPackage = ref<DataPackage>({
    desiredCompleteDate: nextWeek(),
    drawnAreas: []
  });

  const importErrors = ref<string[]>([]);
  const exportErrors = ref<string[]>([]);

  const eventTarget = new EventTarget();

  /**
   * Import data from the encoded string
   */
  function importFromEncodedString(encodedString: string) {
    importErrors.value = [];
    try {
      // decode the data
      const data = JSON.parse(atob(encodedString));

      // verify the data
      const issues = verifyIsDataPackage(data);

      // if there are issues, log them and return
      if (typeof issues !== "undefined") {
        console.error(issues);
        importErrors.value.push(...issues);
        return;
      }

      // set the data
      dataPackage.value = data;

      // dispatch the imported event
      eventTarget.dispatchEvent(new Event("imported"));
    } catch (e) {
      importErrors.value.push("Invalid Data Package; unable to parse data.");
      console.error(e);
      return;
    }
  }

  /**
   * Verify that the data is a valid data package
   *
   * @param data Data to verify
   *
   * @returns `undefined` if the data is valid, otherwise a string describing the error
   */
  function verifyIsDataPackage(data: any): undefined | string[] {
    if (!data) {
      return ["Invalid data package; missing data"];
    }

    if (!Array.isArray(data.drawnAreas) || !data.drawnAreas.length) {
      return ["Invalid data package; missing or corrupt drawnAreas"];
    }

    const polygonIssues: string[] = [];
    for (const area of data.drawnAreas) {
      if (typeof area.id !== "number") {
        polygonIssues.push(`Invalid data package; missing or corrupt id in polygon ${area.id}`);
      }

      if (typeof area.area !== "number") {
        polygonIssues.push(`Invalid data package; missing or corrupt area in polygon ${area.id}`);
      }

      if (!Array.isArray(area.paths) || !area.paths.length) {
        polygonIssues.push(`Invalid data package; missing or corrupt polygon object in polygon ${area.id}`);
      } else {
        for (const path of area.paths) {
          if (!Array.isArray(path) || !path.length) {
            polygonIssues.push(`Invalid data package; missing or corrupt path in polygon ${area.id}`);
          } else {
            for (const latLng of path) {
              if (typeof latLng.lat !== "number" || typeof latLng.lng !== "number") {
                polygonIssues.push(`Invalid data package; missing or corrupt lat/lng in polygon ${area.id}`);
              }
            }
          }
        }
      }

      if (area.type !== "Sod" && area.type !== "Powerwash") {
        polygonIssues.push(`Invalid data package; invalid type in polygon ${area.id} (${area.type})`);
      }
    }

    if (polygonIssues.length) {
      return polygonIssues;
    }
  }

  /**
   * Export the data to an encoded string
   */
  function exportToEncodedString(): string | undefined {
    try {
      return btoa(JSON.stringify(dataPackage.value));
    } catch (e) {
      exportErrors.value.push("Unable to export data package");
      return;
    }
  }

  return { dataPackage, importErrors, exportErrors, eventTarget, importFromEncodedString, exportToEncodedString };
});
