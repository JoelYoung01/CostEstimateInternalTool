export interface DrawnArea {
  polygon: google.maps.Polygon;
  area: number;
  comments?: string;
  fencedInYard?: boolean;
  accessibleFromStreet?: boolean;
  stairsToAccess?: boolean;
}
