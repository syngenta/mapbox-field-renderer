
export const blueColorShade = {
    20: "#c6e6ff",
    30: "#82cfff",
    40: "#31b4f2",
    50: "#0092e4",
    60: "#0071cd",
    70: "#005693",
    80: "#003b69",
    90: "#002747",
  };
  
  export const greenColorShade = {
    20: "#c3ead1",
    30: "#90d6aa",
    40: "#5ebe7f",
    50: "#19a04b",
    60: "#14803c",
    70: "#0c612c",
    80: "#06431c",
    90: "#032d10",
  };
  
  export const purpleColorShade = {
    20: "#e7ddfc",
    30: "#d2bdf9",
    40: "#ba99f6",
    50: "#9664f0",
    60: "#8354d6",
    70: "#643aa9",
    80: "#462779",
    90: "#2e1954",
  };
  
  export const tealColorShade = {
    20: "#a9efe8",
    30: "#5fd2c8",
    40: "#46bbb0",
    50: "#2b9c92",
    60: "#217c74",
    70: "#165c56",
    80: "#0d413c",
    90: "#062b27",
  };
  
  export const orangeColorShade = {
    20: "#ffdac6",
    30: "#ffb59d",
    40: "#ff785a",
    50: "#ee5b3a",
    60: "#c1462b",
    70: "#92331e",
    80: "#682213",
    90: "#48150a",
  };
  
  export const pinkColorShade = {
    20: "#ffd8df",
    30: "#ffb2c1",
    40: "#ff7d96",
    50: "#e85d78",
    60: "#bb485d",
    70: "#8d3545",
    80: "#65232f",
    90: "#45161e",
  };
  
  export const yellowColorShade = {
    20: "#ffe411",
    30: "#f0c355",
    40: "#e99921",
    50: "#c17e19",
    60: "#9a6412",
    70: "#744a0b",
    80: "#523305",
    90: "#372102",
  };
  
  export const cyanColorShade = {
    20: "#ccf7ff",
    30: "#adf2ff",
    40: "#75eaff",
    50: "#3ce1ff",
    60: "#04d9ff",
    70: "#00adcc",
    80: "#00820f",
    90: "#005766",
  };
  
  export const magentaColorShade = {
    20: "#FFE5FF",
    30: "#FFACFF",
    40: "#FF73FF",
    50: "#FF39FF",
    60: "#F0F",
    70: "#C0C",
    80: "#909",
    90: "#606",
  };
  
  export const limeColorShade = {
    20: "#F7FFD1",
    30: "#F0FFAE",
    40: "#E6FF75",
    50: "#DCFF3D",
    60: "#CEFA05",
    70: "#A3C700",
    80: "#799400",
    90: "#506100",
  };
  
  export const colorMatrix = [
    blueColorShade,
    greenColorShade,
    purpleColorShade,
    tealColorShade,
    orangeColorShade,
    pinkColorShade,
    yellowColorShade,
    cyanColorShade,
    magentaColorShade,
    limeColorShade,
  ];
  

export const getColorForSeeds = (rates: number[], rate: number, varietyIndex: number) => {
  const colorShade = colorMatrix[varietyIndex % colorMatrix.length];
  const average = rates.reduce((sum, r) => sum + r, 0) / rates.length;

  if (rate === average) return colorShade[50];

  if (rate < average) {
    const lowerThanAvg = rates.filter((r) => r < average).sort((a, b) => b - a);
    const position = lowerThanAvg.indexOf(rate);
    if (position === 0) return colorShade[40];
    if (position === 1) return colorShade[30];
    return colorShade[20];
  }

  if (rate > average) {
    const higherThanAvg = rates.filter((r) => r > average).sort((a, b) => a - b);
    const position = higherThanAvg.indexOf(rate);
    if (position === 0) return colorShade[60];
    if (position === 1) return colorShade[70];
    if (position === 2) return colorShade[80];
    return colorShade[90];
  }

  return colorShade[50];
};

export const getColorForBiologicals = (treated: boolean) => {
  return treated ? blueColorShade[50] : "transparent";
};

export const getColorForFertilisers = (rates: number[], rate: number) => {
    console.log("rates", rates, rate);
  const average = rates.reduce((sum, r) => sum + r, 0) / rates.length;

  if (rate === average) return blueColorShade[50];

  if (rate < average) {
    const lowerThanAvg = rates.filter((r) => r < average).sort((a, b) => b - a);
    const position = lowerThanAvg.indexOf(rate);
    if (position === 0) return blueColorShade[40];
    if (position === 1) return blueColorShade[30];
    return blueColorShade[20];
  }

  if (rate > average) {
    const higherThanAvg = rates.filter((r) => r > average).sort((a, b) => a - b);
    const position = higherThanAvg.indexOf(rate);
    if (position === 0) return blueColorShade[60];
    if (position === 1) return blueColorShade[70];
    if (position === 2) return blueColorShade[80];
    return blueColorShade[90];
  }

  return blueColorShade[50];
};

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const getColorForPlot = (plot: any, index: number, selectedProperty: string) => {
  let colorNew = getRandomColor();
  if (selectedProperty === "seeds") {
    const rates = plot.properties.seeds.rates_and_dosages.map((d: any) => d.rate);
    const rate = plot.properties.seeds.rates_and_dosages[index].rate;
    const varietyIndex = plot.properties.seeds.rates_and_dosages.findIndex(
      (d: any) => d.variety === plot.properties.seeds.rates_and_dosages[index].variety
    );
    colorNew = getColorForSeeds(rates, rate, varietyIndex);
  } else if (selectedProperty === "biologicals") {
    const treated = plot.properties.biologicals?.treatments[0][index].treated ?? false;
    colorNew = getColorForBiologicals(treated);
  } else if (selectedProperty === "fertilisers") {
    const rates = plot.properties.fertilisers.rates_and_dosages.map((d: any) => d.rate);
    const rate = plot.properties.fertilisers.rates_and_dosages[index].rate;
    colorNew = getColorForFertilisers(rates, rate);
  }
  return colorNew;
};