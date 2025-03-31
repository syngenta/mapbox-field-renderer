import mapboxgl from "mapbox-gl";
import { Point, Polygon, MultiPolygon } from "geojson";
import * as turf from "@turf/turf";

const dragSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-80 310-250l57-57 73 73v-206H235l73 72-58 58L80-480l169-169 57 57-72 72h206v-206l-73 73-57-57 170-170 170 170-57 57-73-73v206h205l-73-72 58-58 170 170-170 170-57-57 73-73H520v205l72-73 58 58L480-80Z"/></svg>`;
const rotateSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-200q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM163-480q14-119 104-199.5T479-760q73 0 135 29.5T720-650v-110h80v280H520v-80h168q-32-54-86.5-87T480-680q-88 0-155 57t-81 143h-81Z"/></svg>`;
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
       // Create a custom element for the marker using dragSvg
       const dragElement = document.createElement("div");
       dragElement.innerHTML = dragSvg;
   
       // Add a marker to the map with the custom icon
       const marker = new mapboxgl.Marker({ draggable: true, element: dragElement })
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
    let data = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry> | GeoJSON.Feature<GeoJSON.Geometry>;
    if (!data) return new mapboxgl.Marker(); // Return an empty marker if data is not available
  
    // Function to calculate the center of the geometry
    const calculateCenter = () => {
      data = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry> | GeoJSON.Feature<GeoJSON.Geometry>;
      return turf.center(data).geometry.coordinates;
    };
  
    // Calculate the initial center of the geometry
    let center = calculateCenter();
  
    // Calculate the bounding box and its diagonal
    const bbox = turf.bbox(data);
    const diagonal = Math.sqrt(
      Math.pow(bbox[2] - bbox[0], 2) + Math.pow(bbox[3] - bbox[1], 2)
    );
    const maxDistance = diagonal / 2;
  
    // Set the initial position of the marker to an extreme corner from the center
    const initialLng = center[0] + maxDistance * Math.cos(Math.PI / 4);
    const initialLat = center[1] + maxDistance * Math.sin(Math.PI / 4);
  
     // Create a custom element for the marker using rotateSvg
     const rotateElement = document.createElement("div");
     rotateElement.innerHTML = rotateSvg;
 
     const marker = new mapboxgl.Marker({ draggable: true, element: rotateElement })
       .setLngLat([initialLng, initialLat])
       .addTo(map);
  
    let lastAngle = 0;
    let isDragging = false;
  
    marker.on("dragstart", () => {
      isDragging = true;
    });
  
    marker.on("dragend", () => {
      isDragging = false;
    });
  
    marker.on("drag", () => {
      const newCenter = marker.getLngLat();
      const dx = newCenter.lng - center[0];
      const dy = newCenter.lat - center[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // Calculate angle in degrees
  
      if (distance > maxDistance) {
        // Constrain the distance to the maximum allowed distance
        const constrainedLng = center[0] + maxDistance * Math.cos((angle * Math.PI) / 180);
        const constrainedLat = center[1] + maxDistance * Math.sin((angle * Math.PI) / 180);
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
           lastAngle - angle, // Corrected the angle difference
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
            feature.geometry = rotateGeometry(feature.geometry, center, angle);
          }
        });
      } else if (data.type === "Feature") {
        if (
          data.geometry.type === "Polygon" ||
          data.geometry.type === "MultiPolygon" ||
          data.geometry.type === "LineString" ||
          data.geometry.type === "Point"
        ) {
          data.geometry = rotateGeometry(data.geometry, center, angle);
        }
      }
  
      lastAngle = angle;
      source.setData(data);
  
      // Constrain marker to circular path around the center
      const constrainedLng = center[0] + distance * Math.cos((angle * Math.PI) / 180);
      const constrainedLat = center[1] + distance * Math.sin((angle * Math.PI) / 180);
      marker.setLngLat([constrainedLng, constrainedLat]);
    });
  
    // Update the center and marker position when the source data changes
    map.on('sourcedata', (e) => {
      if (e.sourceId === sourceId && e.isSourceLoaded && !isDragging) {
        const newCenter = calculateCenter();
        if (newCenter[0] !== center[0] || newCenter[1] !== center[1]) {
          center = newCenter;
          const newInitialLng = center[0] + maxDistance * Math.cos(Math.PI / 4);
          const newInitialLat = center[1] + maxDistance * Math.sin(Math.PI / 4);
          marker.setLngLat([newInitialLng, newInitialLat]);
        }
      }
    });
  
    return marker;
  }