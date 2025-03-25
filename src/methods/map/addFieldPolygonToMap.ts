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
  lineWidth: number = 2
) => {
  addGeoJsonSource(map, "polygon", geometry);
  addFillLayer(map, "polygon", fillColor, fillOpacity);
  addLineLayer(map, "polygon-outline", "polygon", lineColor, lineWidth);
};