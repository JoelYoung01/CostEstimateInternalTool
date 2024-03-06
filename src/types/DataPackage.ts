import type { DrawnArea } from ".";

export interface DataPackage {
  name?: string;
  email?: string;
  phone?: string;
  desiredCompleteDate?: Date;
  mapCenter?: { lat: number; lng: number };
  mapZoom?: number;
  drawnAreas: DrawnArea[];
}
