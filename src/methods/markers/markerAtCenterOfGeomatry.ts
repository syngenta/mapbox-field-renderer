import mapboxgl from "mapbox-gl";
import { Point, Polygon, MultiPolygon } from "geojson";
import * as turf from "@turf/turf";

// Function that takes a GeoJSON object and returns a marker at the center of the geometry
export function getCenterOfPolygon(geometry: Polygon | MultiPolygon): Point {
  // Use Turf.js to calculate the center of the geometry
  const center = turf.centerOfMass(geometry);

  // Return the center as a GeoJSON point
  return center.geometry as Point;
}

export function addMarkerAtPoint(
    point: Point,
    map: mapboxgl.Map,
    sourceId: string
  ): mapboxgl.Marker {
    // Add a marker to the map
    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat(point.coordinates as [number, number])
      .addTo(map);
  
    marker.on("drag", () => {
      const newCenter = marker.getLngLat();
      const dx = newCenter.lng - point.coordinates[0];
      const dy = newCenter.lat - point.coordinates[1];
  
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
      const data = source._data as GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  
      function updateCoordinates(geometry: GeoJSON.Geometry) {
        if (geometry.type === "Polygon") {
          const newCoordinates = (geometry.coordinates as number[][][]).map(
            (ring) => {
              return ring.map((coord) => {
                return [coord[0] + dx, coord[1] + dy];
              });
            }
          );
          geometry.coordinates = newCoordinates;
        } else if (geometry.type === "MultiPolygon") {
          const newCoordinates = (geometry.coordinates as number[][][][]).map(
            (polygon) => {
              return polygon.map((ring) => {
                return ring.map((coord) => {
                  return [coord[0] + dx, coord[1] + dy];
                });
              });
            }
          );
          geometry.coordinates = newCoordinates;
        } else if (geometry.type === "LineString") {
          const newCoordinates = (geometry.coordinates as number[][]).map(
            (coord) => {
              return [coord[0] + dx, coord[1] + dy];
            }
          );
          geometry.coordinates = newCoordinates;
        } else if (geometry.type === "Point") {
          geometry.coordinates = [
            geometry.coordinates[0] + dx,
            geometry.coordinates[1] + dy,
          ];
        }
      }
  
      if (data.type === "FeatureCollection") {
        data.features.forEach(feature => {
          updateCoordinates(feature.geometry);
        });
      } else if (data.type === "Feature") {
        updateCoordinates(data.geometry);
      }
  
      source.setData(data);
      // Update the original point coordinates
      point.coordinates[0] = newCenter.lng;
      point.coordinates[1] = newCenter.lat;
    });
  
    return marker;
  }

export function addRotationMarker(
    point: Point,
    map: mapboxgl.Map,
    sourceId: string
  ): mapboxgl.Marker {
    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
    const data = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry> | GeoJSON.Feature<GeoJSON.Geometry>;
    if (!data) return new mapboxgl.Marker(); // Return an empty marker if data is not available
  
    // Calculate the bounding box and its diagonal
    const bbox = turf.bbox(data);
    const diagonal = Math.sqrt(
      Math.pow(bbox[2] - bbox[0], 2) + Math.pow(bbox[3] - bbox[1], 2)
    );
    const maxDistance = diagonal / 2;
  
    // Set the initial position of the marker to one end of the bounding box
    const initialLng = point.coordinates[0] + maxDistance * Math.cos(0);
    const initialLat = point.coordinates[1] + maxDistance * Math.sin(0);
  
    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([initialLng, initialLat])
      .addTo(map);
  
    let lastAngle = 0;
  
    marker.on("drag", () => {
      const newCenter = marker.getLngLat();
      const dx = newCenter.lng - point.coordinates[0];
      const dy = newCenter.lat - point.coordinates[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // Calculate angle in degrees
  
      if (distance > maxDistance) {
        // Constrain the distance to the maximum allowed distance
        const constrainedLng = point.coordinates[0] + maxDistance * Math.cos((angle * Math.PI) / 180);
        const constrainedLat = point.coordinates[1] + maxDistance * Math.sin((angle * Math.PI) / 180);
        marker.setLngLat([constrainedLng, constrainedLat]);
        return;
      }
  
      function rotateGeometry(
        geometry: GeoJSON.Geometry,
        center: number[],
        angle: number
      ) {
        return turf.transformRotate(
          { type: "Feature", geometry, properties: {} },
          lastAngle - angle, // Reverse the angle difference
          { pivot: center }
        ).geometry;
      }
  
      if (data.type === "FeatureCollection") {
        data.features.forEach(feature => {
          if (
            feature.geometry.type === "Polygon" ||
            feature.geometry.type === "MultiPolygon" ||
            feature.geometry.type === "LineString" ||
            feature.geometry.type === "Point"
          ) {
            feature.geometry = rotateGeometry(feature.geometry, point.coordinates, angle);
          }
        });
      } else if (data.type === "Feature") {
        if (
          data.geometry.type === "Polygon" ||
          data.geometry.type === "MultiPolygon" ||
          data.geometry.type === "LineString" ||
          data.geometry.type === "Point"
        ) {
          data.geometry = rotateGeometry(data.geometry, point.coordinates, angle);
        }
      }
  
      lastAngle = angle;
      source.setData(data);
  
      // Constrain marker to circular path around the center
      const constrainedLng = point.coordinates[0] + distance * Math.cos((angle * Math.PI) / 180);
      const constrainedLat = point.coordinates[1] + distance * Math.sin((angle * Math.PI) / 180);
      marker.setLngLat([constrainedLng, constrainedLat]);
    });
  
    return marker;
  }