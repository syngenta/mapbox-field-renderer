export const addLineLayer = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  layerId: string,
  sourceId: string,
  color: string,
  width: number,
  dashArray?: number[]
) => {
  if (map.current!.getLayer(layerId)) {
    map.current!.removeLayer(layerId);
  }
  const paint: mapboxgl.LinePaint = {
    "line-color": color,
    "line-width": width,
  };
  if (dashArray && dashArray.length > 0) {
    paint["line-dasharray"] = dashArray;
  }

  map.current!.addLayer({
    id: layerId,
    type: "line",
    source: sourceId,
    layout: {},
    paint: paint,
  });
};