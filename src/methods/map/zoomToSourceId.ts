import mapboxgl from 'mapbox-gl';
import bbox from '@turf/bbox';

/**
 * Zooms the map to fit the given source ID.
 * @param map - The Mapbox GL JS map instance.
 * @param sourceId - The ID of the source to zoom to.
 */
export function zoomToSourceId(map: mapboxgl.Map|null, sourceId: string): void {
    const source = map?.getSource(sourceId) as mapboxgl.GeoJSONSource;
    if (!source) {
        console.error(`Source with ID ${sourceId} not found.`);
        return;
    }

    const data = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    if (!data || !data.features || data.features.length === 0) {
        console.error(`No features found in source with ID ${sourceId}.`);
        return;
    }

    try {
        const boundingBox = bbox(data); // Calculate the bounding box using Turf.js
        map?.fitBounds(boundingBox as [number, number, number, number], {
            padding: 20
        });
    } catch (error) {
        console.error(`Error calculating bounding box for source with ID ${sourceId}:`, error);
    }
}

export function zoomToGeoJson(map: mapboxgl.Map|null, geoJson: GeoJSON.Geometry): void {
    if (!map) {
        console.error('Map instance is not provided.');
        return;
    }

    if (!geoJson || !geoJson.type || (geoJson.type !== 'GeometryCollection' && !('coordinates' in geoJson))) {
        console.error('Invalid GeoJSON object provided.');
        return;
    }

    try {
        const boundingBox = bbox(geoJson); // Calculate the bounding box using Turf.js
        map.fitBounds(boundingBox as [number, number, number, number], {
            padding: 40
        });
    } catch (error) {
        console.error('Error calculating bounding box for the provided GeoJSON object:', error);
    }
}