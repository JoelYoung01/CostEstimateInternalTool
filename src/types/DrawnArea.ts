export interface DrawnArea {
  id: number;

  /** An array of the area's paths, used to import/export polygon data*/
  paths: { lat: number; lng: number }[][];

  area: number;
  type: "Sod" | "Powerwash";
  comments?: string;

  fencedInYard?: boolean;
  accessibleFromStreet?: boolean;
  stairsToAccess?: boolean;

  location?: SodLocationType[];
}

export type SodLocationType = "Back Yard" | "Front Yard" | "Side Yard" | "Other";
