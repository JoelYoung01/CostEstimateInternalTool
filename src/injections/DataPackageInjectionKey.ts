import { type InjectionKey, type Ref } from "vue";
import type { DataPackage } from "@/types";
import { useUtilities } from "@/composables";

const { nextWeek } = useUtilities();

type DataPackageType = Ref<DataPackage>;

export const DataPackageInjectionKey = Symbol(
  "Injection Symbol for the app's Data Package"
) as InjectionKey<DataPackageType>;

export const DefaultDataPackage = {
  desiredCompleteDate: nextWeek(),
  drawnAreas: []
};
