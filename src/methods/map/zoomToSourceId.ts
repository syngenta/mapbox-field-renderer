import mapboxgl from 'mapbox-gl';

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

    const coordinates = data.features.reduce((acc, feature) => {
        if (feature.geometry.type === 'Point') {
            acc.push(feature.geometry.coordinates as [number, number]);
        } else if (feature.geometry.type === 'Polygon') {
            acc.push(...(feature.geometry.coordinates[0] as [number, number][]));
        } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach(polygon => {
                acc.push(...(polygon[0] as [number, number][]));
            });
        }
        return acc;
    }, [] as [number, number][]);

    if (coordinates.length === 0) {
        console.error(`No valid coordinates found in source with ID ${sourceId}.`);
        return;
    }

    const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map?.fitBounds(bounds, {
        padding: 20
    });
}