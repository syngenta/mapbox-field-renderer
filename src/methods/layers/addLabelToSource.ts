import * as turf from "@turf/turf";

export const addLabelToSource = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  sourceId: string,
  label: string,
  position: "center" | "top" | "bottom" | "left" | "right" = "center",
  offset: number = 0,
  layerPrefix: string = "",
  fontSize: number = 12,
) => {
  const createLabelLayer = () => {
    const source = map.current!.getSource(sourceId) as mapboxgl.GeoJSONSource;
    if (!source) {
      console.error(`Source with ID ${sourceId} not found`);
      return;
    }

    const data = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    const center = turf.centerOfMass(data);
    const bbox = turf.bbox(data);

    let labelCoordinates = center.geometry.coordinates as GeoJSON.Position;

    if (position !== "center" || offset !== 0) {
      const offsetInDegrees = offset / 111320; // Convert meters to degrees (approximation)
      switch (position) {
        case "top":
          labelCoordinates = [(bbox[0] + bbox[2]) / 2, bbox[3] + offsetInDegrees];
          break;
        case "bottom":
          labelCoordinates = [(bbox[0] + bbox[2]) / 2, bbox[1] - offsetInDegrees];
          break;
        case "left":
          labelCoordinates = [bbox[0] - offsetInDegrees, (bbox[1] + bbox[3]) / 2];
          break;
        case "right":
          labelCoordinates = [bbox[2] + offsetInDegrees, (bbox[1] + bbox[3]) / 2];
          break;
        default:
          break;
      }
    }

    const labelSourceId = `${sourceId}-label-${layerPrefix}`;

    if (map.current!.getLayer(labelSourceId)) {
      map.current!.removeLayer(labelSourceId);
    }

    if (map.current!.getSource(labelSourceId)) {
      map.current!.removeSource(labelSourceId);
    }

    map.current!.addSource(labelSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: labelCoordinates,
        },
        properties: {
          label: label,
        },
      },
    });

    map.current!.addLayer({
      id: labelSourceId,
      type: "symbol",
      source: labelSourceId,
      layout: {
        "text-field": ["get", "label"],
        "text-size": fontSize,
        "text-offset": [0, 0],
        "text-anchor": "top",
      },
      paint: {
        "text-color": "white",
        "text-halo-color": "black",
        "text-halo-width": 1,
      },
    });
  };

  createLabelLayer();

  map.current!.on('sourcedata', (e) => {
    if (e.sourceId === sourceId && e.isSourceLoaded) {
      createLabelLayer();
    }
  });
};