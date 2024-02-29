export interface DrawnArea {
  id: number;
  polygon: google.maps.Polygon;
  area: number;
  type: "Sod" | "Powerwash";
  comments?: string;
  fencedInYard?: boolean;
  accessibleFromStreet?: boolean;
  stairsToAccess?: boolean;
}
