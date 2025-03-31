import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import { MultiPolygon } from "geojson";
import { getColorForPlot } from "../../utils/colorUtils";
import type { NewTrialType } from "../../types";

export const addMultiPolygonSourceWithMarker = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  sourceId: string,
  coordinates: MultiPolygon["coordinates"],
  plot: any,
  selectedProperty: string,
  selectedApplication: number,
  fillOpacity: number,
  lineColor: string,
  lineWidth: number,
  replicant: boolean = false,
  replicantLineDashArray?: number[]
) => {
  if (!map.current) return;

  // Remove existing layers first
  if (map.current.getLayer(sourceId)) {
    map.current.removeLayer(sourceId);
  }
  if (map.current.getLayer(`${sourceId}-outline`)) {
    map.current.removeLayer(`${sourceId}-outline`);
  }

  // Remove existing source
  if (map.current.getSource(sourceId)) {
    map.current.removeSource(sourceId);
  }

  // Create FeatureCollection where each polygon gets a unique color
  const geoJsonData: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: coordinates.map((polygonCoords, index) => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: polygonCoords,
      },
      properties: {
        color: getColorForPlot(
          plot,
          index,
          selectedProperty,
          selectedApplication
        ),
        description: `${sourceId}-${index}`,
      },
    })),
  };

  // Add GeoJSON Source
  map.current.addSource(sourceId, {
    type: "geojson",
    data: geoJsonData,
  });

  // Add Fill Layer (Using data-driven styling for color)
  map.current.addLayer({
    id: sourceId,
    type: "fill",
    source: sourceId,
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": fillOpacity,
    },
  });

  // Add Outline Layer
  map.current.addLayer({
    id: `${sourceId}-outline`,
    type: "line",
    source: sourceId,
    layout: {},
    paint: {
      "line-color": lineColor,
      "line-width": lineWidth,
      ...(replicant && replicantLineDashArray
        ? { "line-dasharray": replicantLineDashArray }
        : {}),
    },
  });
};

export const addTrialPlotsToMap = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  trialPlots: NewTrialType["trial_plots"],
  selectedProperty: string,
  selectedApplication: number,
  tooltipRef: any,
  setHoveredPlot: any,
  fillOpacity: number = 0.8,
  lineColor: string = "#ffffff",
  lineWidth: number = 1,
  replicantLineDashArray: number[] = [2, 2]
) => {
  if (!map.current) return;

  trialPlots.forEach((plot, plotIndex: number) => {
    // Add main plot
    const mainPlotSourceId = `plot-${plotIndex}`;
    addMultiPolygonSourceWithMarker(
      map,
      mainPlotSourceId,
      (plot.plot.geojson.geometry as MultiPolygon).coordinates,
      plot,
      selectedProperty,
      selectedApplication,
      fillOpacity,
      lineColor,
      lineWidth
    );

    // Add replicants
    const replicantCoordinates: MultiPolygon["coordinates"] = [];
    plot.replicants?.forEach((replicant) => {
      replicantCoordinates.push(
        ...(replicant.geojson.geometry as MultiPolygon).coordinates
      );
    });

    if (replicantCoordinates.length > 0) {
      const replicantSourceId = `replicant-plot-${plotIndex}`;
      addMultiPolygonSourceWithMarker(
        map,
        replicantSourceId,
        replicantCoordinates,
        plot,
        selectedProperty,
        selectedApplication,
        fillOpacity,
        lineColor,
        lineWidth,
        true,
        replicantLineDashArray
      );
    }
  });
};
