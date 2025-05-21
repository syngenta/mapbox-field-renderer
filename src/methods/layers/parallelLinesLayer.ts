import type mapboxgl from "mapbox-gl";
import  * as turf from "@turf/turf";
import type { Polygon, MultiPolygon, LineString, Feature, FeatureCollection } from "geojson"; // Import types from geojson library

interface Options {
  spacing?: number;
  color?: string;
}

export function parallelLinesLayerfromPoint(
  map: mapboxgl.Map,
  turfPolygon: Feature<Polygon | MultiPolygon>, // Use geojson.Polygon and geojson.MultiPolygon
  start: number[],
  end: number[],
  gridSourceId: string,
  lineId: string,
  options: Options = { spacing: 100, color: "#888" }
): void {
  const { spacing = 100, color = "#888" } = options;
  const baseLine = extendLine(start, end, 1000);
  const gridLines = createGridLines(baseLine, turfPolygon, spacing);

  const gridData: FeatureCollection<LineString> = {
    type: "FeatureCollection",
    features: gridLines,
  };

  if (map.getSource(gridSourceId)) {
    (map.getSource(gridSourceId) as mapboxgl.GeoJSONSource).setData(gridData);
  } else {
    map.addSource(gridSourceId, { type: "geojson", data: gridData });
    map.addLayer({
      id: lineId,
      type: "line",
      source: gridSourceId,
      paint: { "line-color": color, "line-width": 2 },
    });
  }
}

function extendLine(
  start: number[],
  end: number[],
  scaleFactor: number
): Feature<LineString> {
  const [dx, dy] = [end[0] - start[0], end[1] - start[1]];
  return turf.lineString([
    [start[0] - dx * scaleFactor, start[1] - dy * scaleFactor],
    [end[0] + dx * scaleFactor, end[1] + dy * scaleFactor],
  ]);
}

function createGridLines(
  baseLine: Feature<LineString>,
  polygon: Feature<Polygon | MultiPolygon>, // Use geojson.Polygon and geojson.MultiPolygon
  spacing: number
): Feature<LineString>[] {
  const gridLines: Feature<LineString>[] = [];
  const maxOffset = 500; // in kilometers
  const step = spacing / 1000; // convert spacing to kilometers

  // Calculate the bearing of the base line
  const baseLineBearing = turf.bearing(
    turf.point(baseLine.geometry.coordinates[0]),
    turf.point(baseLine.geometry.coordinates[1])
  );

  for (const direction of [0, -1, 1]) {
    for (let offset = step; Math.abs(offset) <= maxOffset; offset += step) {
      // Use turf.lineOffset with rhumb lines for more accurate offset on a sphere
      const offsetLine = turf.transformTranslate(
        baseLine,
        offset * direction,
        90 + baseLineBearing,
        {
          units: "kilometers",
          mutate: false,
        }
      );

      const intersections = turf.lineIntersect(offsetLine, polygon);

      if (intersections.features.length >= 2) {
        // Sort intersection points along the offset line
        const sortedPoints = turf
          .featureCollection(intersections.features)
          .features.sort((a, b) => {
            return (
              turf.distance(turf.point(offsetLine.geometry.coordinates[0]), a, {
                units: "kilometers",
              }) -
              turf.distance(turf.point(offsetLine.geometry.coordinates[0]), b, {
                units: "kilometers",
              })
            );
          });

        for (let i = 0; i < sortedPoints.length - 1; i += 2) {
          // Use greatCircle for creating lines that account for Earth's curvature
          const greatCircleLine = turf.greatCircle(
            sortedPoints[i].geometry.coordinates,
            sortedPoints[i + 1].geometry.coordinates,
            { npoints: 100 }
          ) as Feature<LineString>;
          gridLines.push(greatCircleLine);
        }
      }

      if (intersections.features.length < 2 || direction === 0) break;
    }
  }

  return gridLines;
}