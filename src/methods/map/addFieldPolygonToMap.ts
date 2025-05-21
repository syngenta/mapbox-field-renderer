import { addGeoJsonSource } from "../layers/addGeoJsonSource";
import { addFillLayer } from "../layers/addFillLayer";
import { addLineLayer } from "../layers/addLineLayer";
import type { Polygon } from "geojson";

export const addFieldPolygonToMap = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  geometry: Polygon,
  fillColor: string = "#088",
  fillOpacity: number = 0.3,
  lineColor: string = "#ffffff",
  lineWidth: number = 2,
  prefix: string = "",
) => {
  addGeoJsonSource(map, `${prefix}polygon`, geometry);
  addFillLayer(map, `${prefix}polygon`, fillColor, fillOpacity);
  addLineLayer(map, `${prefix}polygon-outline`, `${prefix}polygon`, lineColor, lineWidth);
};