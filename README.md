# React Mapbox Field Renderer

A modern React component library built with TypeScript and Vite.

## Features

- Built with Mapbox, React 20+ and TypeScript
- Powered by Vite for lightning-fast development
- Hot Module Replacement (HMR) for seamless development experience
- ESLint configuration with TypeScript support
- Minimal setup with maximum flexibility

## Installation

```bash
npm i @syngenta/mapbox-field-renderer
```

## Usage

```tsx
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import {
  initializeMap,
  addTrialPlotsToMap,
  zoomToSourceId,
  updateMapWithSelectedProperty,
  addBufferZoneToMap,
  addMarkerAtPoint,
  addGeoJsonSource,
  addLineLayer,
  zoomToGeoJson,
  parallelLinesLayerfromPoint,
} from "@syngenta/mapbox-field-renderer";

 

function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
    if (map.current) return; // Initialize map only once
    const center = getMapCenter(field);
    if (mapContainer.current && field.geometry) {
      initializeMap(map, mapContainer, center, field.geometry, {
        token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
        preserveDrawingBuffer: mode === "pdf",
        zoom: 13,
        navigationControl: {
          showZoom: false,
        },
      });
    }
  }, [field, selectedField, data, mode]);


  return (
         <div>
              <div
                ref={mapContainer}
                className="w-full h-[60vh] md:h-[80vh] rounded-md "
              />
         </div>
  );
}
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

## Build

```bash
npm run build
```

## Technology Stack

- **React**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and development server
- **ESLint**: Code quality and consistency

## ESLint Configuration

This project includes a robust ESLint setup. For production applications, we recommend enabling type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

For React-specific lint rules, you can install and configure these plugins:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Available Vite Plugins

Two official plugins are available:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## License
Check LICENSE File(MIT License)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
