import React, { useRef, useEffect } from 'react';
import { initializeMap } from '../src/components/map/initializeMap';
import { addBufferZoneToMap } from '../src/components/map/addBufferZoneToMap';
import mapboxgl from 'mapbox-gl';

export default {
  title: 'Layers/AddBufferZoneToMap',
  component: addBufferZoneToMap,
  argTypes: {
    bufferZone: {
      control: 'object',
      defaultValue: { type: 'EXTERNAL', size: 100 },
    },
    lineColor: { control: 'color' },
    lineWidth: { control: 'number' },
    lineDashArray: { control: 'array' },
  },
};

const Template = (args) => {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapContainer.current) {
      initializeMap(map, mapContainer, args.center, null);
      map.current?.on('load', () => {
        addBufferZoneToMap(map, args.geometry, args.bufferZone, args.lineColor, args.lineWidth, args.lineDashArray);
      });
    }
  }, [args.center, args.geometry]);

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      addBufferZoneToMap(map, args.geometry, args.bufferZone, args.lineColor, args.lineWidth, args.lineDashArray);
    } else {
      map.current?.on('load', () => {
        addBufferZoneToMap(map, args.geometry, args.bufferZone, args.lineColor, args.lineWidth, args.lineDashArray);
      });
    }
  }, [args.bufferZone, args.lineColor, args.lineWidth, args.lineDashArray]);

  return <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />;
};

export const Default = Template.bind({});
Default.args = {
  center: [-58.05513867177789, -14.376318356822122],
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-58.06588618918218, -14.36733392749019],
        [-58.06195229532394, -14.38797506734576],
        [-58.05305740512022, -14.38713500317502],
        [-58.044796147105, -14.38522304195507],
        [-58.04796511715806, -14.36447576385609],
        [-58.06588618918218, -14.36733392749019],
      ],
    ],
  },
  bufferZone: { type: 'EXTERNAL', size: 100 },
  lineColor: '#ffffff',
  lineWidth: 2,
  lineDashArray: [2, 2],
};