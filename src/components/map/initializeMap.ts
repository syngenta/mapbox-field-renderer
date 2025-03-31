import mapboxgl from "mapbox-gl";
import { addFieldPolygonToMap } from "./addFieldPolygonToMap";
import type { Geometry, Polygon } from "geojson";
import { zoomToSourceId } from "./zoomToSourceId";

export const initializeMap = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  mapContainer: React.MutableRefObject<HTMLElement | null>,
  center: [number, number],
  geometry: Geometry | null,
  mapStyle: string = "mapbox://styles/mapbox/satellite-v9",
  zoom: number = 12,
  showCompass: boolean = false,
  visualizePitch: boolean = true,
  showZoom: boolean = true
) => {
  mapboxgl.accessToken =
    "pk.eyJ1Ijoic3RyaWRlcmVuZ2luZWVyaW5nIiwiYSI6ImNsdDc0aHpnbDAzYmYyaXBjNDBsZTVtNWgifQ.pnxYXCe5u9Ei4XBQ4Q1kxQ";
  map.current = new mapboxgl.Map({
    container: mapContainer.current!,
    style: mapStyle,
    center: center,
    zoom: zoom,
    attributionControl: false,
  });

  map.current.addControl(
    new mapboxgl.NavigationControl({
      showCompass: showCompass,
      visualizePitch: visualizePitch,
      showZoom: showZoom,
    }),
    "bottom-right"
  );
  if(geometry){
    map.current.on("load", () => {
        addFieldPolygonToMap(map, geometry as Polygon);
      });
     
  }
};