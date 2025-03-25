import * as turf from "@turf/turf";
import { addGeoJsonSource } from "../layers/addGeoJsonSource";
import { addLineLayer } from "../layers/addLineLayer";
import type { Polygon } from "geojson";

export const addBufferZoneToMap = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  geometry: Polygon,
  bufferZone: { type: "INTERNAL" | "EXTERNAL"; size: number },
  lineColor: string = "#ffffff",
  lineWidth: number = 2,
  lineDashArray: number[] = [2, 2]
) => {
  const fieldPolygon = turf.polygon(geometry.coordinates);
  const bufferDistance = bufferZone.size / 1000; // Convert meters to kilometers
  const buffered = turf.buffer(
    fieldPolygon,
    bufferZone.type === "INTERNAL" ? -bufferDistance : bufferDistance,
    { units: "kilometers" }
  );
  if (buffered) {
    addGeoJsonSource(map, "buffer-zone", buffered.geometry);
    addLineLayer(
      map,
      "buffer-zone-outline",
      "buffer-zone",
      lineColor,
      lineWidth,
      lineDashArray
    );
  }
};