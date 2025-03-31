export const addFillLayer = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  layerId: string,
  color: string,
  opacity: number
) => {
  if (map.current!.getLayer(layerId)) {
    map.current!.removeLayer(layerId);
  }
  map.current!.addLayer({
    id: layerId,
    type: "fill",
    source: layerId,
    layout: {},
    paint: {
      "fill-color": color,
      "fill-opacity": opacity,
    },
  });
};