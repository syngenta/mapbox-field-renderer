import React, { useRef, useEffect } from 'react';
import { initializeMap } from '../src/components/map/initializeMap';
import mapboxgl from 'mapbox-gl';

export default {
  title: 'Map/InitializeMap',
  component: initializeMap,
};

const Template = (args) => {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapContainer.current) {
      initializeMap(map, mapContainer, args.center, null);
    }
  }, [args]);

  return <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />;
};

export const Default = Template.bind({});
Default.args = {
  center: [0, 0],
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-10, -10],
        [10, -10],
        [10, 10],
        [-10, 10],
        [-10, -10],
      ],
    ],
  },
};