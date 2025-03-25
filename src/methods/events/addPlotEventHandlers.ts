export const addPlotEventHandlers = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  plotSourceId: string,
  tooltipRef: React.MutableRefObject<HTMLDivElement>,
  setHoveredPlot: any
) => {
  map.current!.on("mouseover", plotSourceId, (e) => {
    map.current!.getCanvas().style.cursor = "pointer";
    const description = e.features![0].properties!.description;
    const match = description.match(/plot-(\d+)-(\d+)/);

    setTimeout(() => {
      if (tooltipRef.current) {
        tooltipRef.current.style.display = "block";
        tooltipRef.current.style.left = `${e.point.x}px`;
        tooltipRef.current.style.top = `${e.point.y}px`;
        tooltipRef.current.innerHTML = description;
      }
      if (match) {
        const plotIndex = parseInt(match[1], 10);
        const subPlotIndex = parseInt(match[2], 10);
        setHoveredPlot({
          plotIndex,
          subPlotIndex,
          properties: e.features![0].properties,
        });
      }
    }, 10);

    map.current!.setPaintProperty(plotSourceId, "fill-opacity", 0.8);
    map.current!.setPaintProperty(`${plotSourceId}-outline`, "line-width", 2);
  });

  map.current!.on("mouseleave", plotSourceId, () => {
    map.current!.getCanvas().style.cursor = "";

    if (tooltipRef.current) {
      tooltipRef.current.style.display = "none";
    }

    setHoveredPlot(null, null);

    map.current!.setPaintProperty(plotSourceId, "fill-opacity", 0.5);
    map.current!.setPaintProperty(`${plotSourceId}-outline`, "line-width", 1);
  });

  map.current!.on("mousemove", plotSourceId, (e) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${e.point.x}px`;
      tooltipRef.current.style.top = `${e.point.y}px`;
    }
  });
};