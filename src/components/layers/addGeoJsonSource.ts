import type { Geometry } from "geojson";

export const addGeoJsonSource = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  sourceId: string,
  geometry: Geometry,
  properties: any = {}
) => {
  if (map.current!.getSource(sourceId)) {
    map.current!.removeSource(sourceId);
  }
  map.current!.addSource(sourceId, {
    type: "geojson",
    data: {
      type: "Feature",
      properties: properties,
      geometry: geometry,
    },
  });
};