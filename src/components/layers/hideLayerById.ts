export function hideLayerById(map: mapboxgl.Map, layerId: string): void {
  const layer = map.getLayer(layerId);
  if (layer) {
    map.setLayoutProperty(layerId, "visibility", "none");
  } else {
    console.warn(`Layer with ID ${layerId} not found.`);
  }
}