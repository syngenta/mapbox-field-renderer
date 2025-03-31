import { addGeoJsonSource } from "./addGeoJsonSource";
import { addFillLayer } from "./addFillLayer";
import type { Polygon } from "geojson";
import { addLabelToSource } from "./addLabelToSource";

export const addPlotSourceAndLayer = (
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

  const label = +(plotSourceId.split("-")?.[ plotSourceId.split("-").length - 1 ])+1;
  addLabelToSource(map, plotSourceId, String(label), "center", 0);
  const groupLabel = +(plotSourceId.split("-")?.[ plotSourceId.split("-").length - 2 ]);
  if(label-1 === 0){
    addLabelToSource(map, plotSourceId, `${String.fromCharCode(65 + groupLabel)}`, "top", 0, 'group', 14);
  }
};
