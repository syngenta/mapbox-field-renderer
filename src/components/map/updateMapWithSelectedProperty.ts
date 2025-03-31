import { addTrialPlotsToMap } from "./addTrialPlotsToMap";

export const updateMapWithSelectedProperty = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  trialPlots: any,
  selectedProperty: string,
  selectedApplication:number,
  tooltipRef: any,
  setHoveredPlot: any
) => {
  if (!map.current?.isStyleLoaded()) {
    map.current?.on("style.load", () => {
      updateMapWithSelectedProperty(
        map,
        trialPlots,
        selectedProperty,
        selectedApplication,
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
    selectedApplication,
    tooltipRef,
    setHoveredPlot
  );
};