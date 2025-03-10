export function getAllLayers(map: mapboxgl.Map): mapboxgl.Layer[] {
  return map.getStyle()?.layers || [];
}