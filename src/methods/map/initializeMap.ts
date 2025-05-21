import mapboxgl, { MapboxOptions } from "mapbox-gl";
import { addFieldPolygonToMap } from "./addFieldPolygonToMap";
import type { Geometry, Polygon } from "geojson";
import { zoomToSourceId } from "./zoomToSourceId";

interface MapConfig extends Partial<Omit<MapboxOptions, 'container' | 'center'>> {
  token: string; // Required token
  navigationControl?: {
    showCompass?: boolean;
    visualizePitch?: boolean;
    showZoom?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
}

const DEFAULT_CONFIG: Omit<MapConfig, 'token'> = {
  style: "mapbox://styles/mapbox/satellite-v9",
  zoom: 12,
  attributionControl: false,
  preserveDrawingBuffer: true,
  navigationControl: {
    showCompass: false,
    visualizePitch: true,
    showZoom: true,
    position: 'bottom-right'
  }
};

export const initializeMap = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  mapContainer: React.MutableRefObject<HTMLElement | null>,
  center: [number, number],
  geometry: Geometry | null,
  config: MapConfig
) => {
  if (!mapContainer.current) {
    throw new Error('Map container reference is not initialized');
  }

  if (!config.token) {
    throw new Error('Mapbox access token is required');
  }

  // Set access token from config
  mapboxgl.accessToken = config.token;

  // Merge default config with user provided config
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { navigationControl, ...mapOptions } = finalConfig;

  // Initialize map
  map.current = new mapboxgl.Map({
    ...mapOptions,
    container: mapContainer.current,
    center,
  });

  // Add navigation control
  const navControl = new mapboxgl.NavigationControl({
    showCompass: navigationControl?.showCompass ?? DEFAULT_CONFIG.navigationControl?.showCompass,
    visualizePitch: navigationControl?.visualizePitch ?? DEFAULT_CONFIG.navigationControl?.visualizePitch,
    showZoom: navigationControl?.showZoom ?? DEFAULT_CONFIG.navigationControl?.showZoom,
  });

  map.current.addControl(
    navControl,
    navigationControl?.position ?? DEFAULT_CONFIG.navigationControl?.position
  );

  // Add geometry if provided
  if (geometry) {
    map.current.on("load", () => {
      if (geometry.type === 'Polygon') {
        addFieldPolygonToMap(map, geometry as Polygon);
      }
    });
  }
};