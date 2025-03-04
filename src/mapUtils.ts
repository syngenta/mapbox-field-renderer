import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import { getColorForPlot } from "./colorUtils";
import type { Geometry, Polygon } from "geojson";
import type { NewTrialType } from "./types";

export const initializeMap = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  mapContainer: React.MutableRefObject<HTMLElement | null>,
  center: [number, number],
  geometry: Geometry,
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

  map.current.on("load", () => {
    addFieldPolygonToMap(map, geometry as Polygon);
  });
};

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

export const addTrialPlotsToMap = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  trialPlots: NewTrialType["trial_plots"],
  selectedProperty: string,
  tooltipRef: any,
  setHoveredPlot: any,
  fillOpacity: number = 0.8,
  lineColor: string = "#ffffff",
  lineWidth: number = 1,
  replicantLineDashArray: number[] = [2, 2]
) => {
  trialPlots.forEach((plot, plotIndex: number) => {
    plot.plot.geojson.geometry.coordinates.forEach(
      (polygonCoordinates: any, index: number) => {
        const plotSourceId = `plot-${plotIndex}-${index}`;
        if (!map.current!.getSource(plotSourceId)) {
          const colorNew = getColorForPlot(plot, index, selectedProperty);
          addPlotSourceAndLayer(
            map,
            plotSourceId,
            polygonCoordinates,
            colorNew,
            fillOpacity,
            lineColor,
            lineWidth
          );
          addPlotEventHandlers(map, plotSourceId, tooltipRef, setHoveredPlot);
        }
      }
    );

    plot.replicants?.forEach((replicant: any) => {
      replicant.geojson.geometry.coordinates.forEach(
        (polygonCoordinates: any, index: number) => {
          const plotSourceId = `replicant-plot-${plotIndex}-${index}`;
          if (!map.current!.getSource(plotSourceId)) {
            const colorNew = getColorForPlot(plot, index, selectedProperty);
            addPlotSourceAndLayer(
              map,
              plotSourceId,
              polygonCoordinates,
              colorNew,
              fillOpacity,
              lineColor,
              lineWidth,
              true,
              replicantLineDashArray
            );
            addPlotEventHandlers(map, plotSourceId, tooltipRef, setHoveredPlot);
          }
        }
      );
    });
  });
};

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

const addFillLayer = (
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
  if (dashArray) {
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

const addPlotSourceAndLayer = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  plotSourceId: string,
  polygonCoordinates: Polygon["coordinates"],
  colorNew: string,
  fillOpacity: number,
  lineColor: string,
  lineWidth: number,
  replicant: boolean = false,
  replicantLineDashArray?: number[]
) => {
  addGeoJsonSource(
    map,
    plotSourceId,
    {
      type: "Polygon",
      coordinates: polygonCoordinates,
    },
    {
      description: `${plotSourceId}`,
    }
  );

  addFillLayer(map, plotSourceId, colorNew, fillOpacity);

  const outlineLayer: mapboxgl.Layer = {
    id: `${plotSourceId}-outline`,
    type: "line",
    source: plotSourceId,
    layout: {},
    paint: {
      "line-color": lineColor,
      "line-width": lineWidth,
    },
  };

  if (replicant && outlineLayer.paint && replicantLineDashArray) {
    (outlineLayer.paint as any)["line-dasharray"] = replicantLineDashArray; // Dashed line if replicant is true
  }

  map.current!.addLayer(outlineLayer);
};

const addPlotEventHandlers = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  plotSourceId: string,
  tooltipRef: React.RefObject<HTMLDivElement>,
  setHoveredPlot: any
) => {
  map.current!.on("mouseover", plotSourceId, (e) => {
    map.current!.getCanvas().style.cursor = "pointer";
    const description = e.features![0].properties!.description;
    console.log("description", description);
    const match = description.match(/plot-(\d+)-(\d+)/);

    setTimeout(() => {
      if (tooltipRef.current) {
        tooltipRef.current.style.display = "block";
        tooltipRef.current.style.left = `${e.point.x}px`;
        tooltipRef.current.style.top = `${e.point.y}px`;
        tooltipRef.current.innerHTML = description;
      }
      if (match) {
        const plotIndex = parseInt(match[1], 10);
        const subPlotIndex = parseInt(match[2], 10);
        setHoveredPlot({
          plotIndex,
          subPlotIndex,
          properties: e.features![0].properties,
        });
      }
    }, 10);

    map.current!.setPaintProperty(plotSourceId, "fill-opacity", 0.8);
    map.current!.setPaintProperty(`${plotSourceId}-outline`, "line-width", 2);
  });

  map.current!.on("mouseleave", plotSourceId, () => {
    map.current!.getCanvas().style.cursor = "";

    if (tooltipRef.current) {
      tooltipRef.current.style.display = "none";
    }

    setHoveredPlot(null, null);

    map.current!.setPaintProperty(plotSourceId, "fill-opacity", 0.5);
    map.current!.setPaintProperty(`${plotSourceId}-outline`, "line-width", 1);
  });

  map.current!.on("mousemove", plotSourceId, (e) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${e.point.x}px`;
      tooltipRef.current.style.top = `${e.point.y}px`;
    }
  });
};

export const updateMapWithSelectedProperty = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  trialPlots: any,
  selectedProperty: string,
  tooltipRef: any,
  setHoveredPlot: any
) => {
  if (!map.current?.isStyleLoaded()) {
    map.current?.on("style.load", () => {
      updateMapWithSelectedProperty(
        map,
        trialPlots,
        selectedProperty,
        tooltipRef,
        setHoveredPlot
      );
    });
    return;
  }

  // Clear existing layers
  trialPlots.forEach((plot: any, plotIndex: number) => {
    plot.plot.geojson.geometry.coordinates.forEach((_: any, index: number) => {
      const plotSourceId = `plot-${plotIndex}-${index}`;
      if (map.current!.getLayer(plotSourceId)) {
        map.current!.removeLayer(plotSourceId);
        map.current!.removeLayer(`${plotSourceId}-outline`);
        map.current!.removeSource(plotSourceId);
      }
    });
  });

  // Add new layers based on selected property
  addTrialPlotsToMap(
    map,
    trialPlots,
    selectedProperty,
    tooltipRef,
    setHoveredPlot
  );
};

export function getAllLayers(map: mapboxgl.Map): mapboxgl.Layer[] {
  return map.getStyle()?.layers || [];
}

export function hideLayerById(map: mapboxgl.Map, layerId: string): void {
  const layer = map.getLayer(layerId);
  if (layer) {
    map.setLayoutProperty(layerId, "visibility", "none");
  } else {
    console.warn(`Layer with ID ${layerId} not found.`);
  }
}
