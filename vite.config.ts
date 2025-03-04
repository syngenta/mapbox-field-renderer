
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), dts({insertTypesEntry: true,include: ['src/**/*.ts', 'node_modules/@types/mapbox-gl/index.d.ts'],})],
  build: {
    // sourcemap: true,
    lib: {
      entry: "src/index.ts", // Main entry point
      name: "SyngentaMapbox",
      fileName: (format) => `syngenta-mapbox.${format}.js`,
      formats:["es"], // Support both ESM
    },
    rollupOptions: {
      external: ["react", "react-dom", "mapbox-gl", "@turf/turf","geojson"], // Don't bundle these dependencies
      output: {
        entryFileNames:"index.js",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "mapbox-gl": "mapboxgl",
          "@turf/turf": "turf",
          "geojson":"geojson",
        }
      }
    },
  }
});