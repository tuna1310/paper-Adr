export interface MapCountryNode {
  id: string;
  name: string;
  continentId: string;
  code: string;
  flagColors: string[];
  percent: number;
  completed: boolean;
  unlocked: boolean;
  x: number;
  y: number;
}

export interface MapContinentZone {
  id: string;
  name: string;
  completed: number;
  total: number;
  unlocked: boolean;
  cx: number;
  cy: number;
  polygon: Array<[number, number]>;
}

const CONTINENT_SHAPES: Record<string, { cx: number; cy: number; poly: Array<[number, number]>; offsets: Array<[number, number]> }> = {
  north_america: {
    cx: 270, cy: 255,
    poly: [
      [115, 130], [220, 95], [355, 110], [420, 175], [375, 255], [320, 315], [345, 375], [295, 405], [240, 355], [170, 290], [115, 210],
    ],
    offsets: [[-85, -70], [25, -75], [-60, -15], [55, -20], [-25, 35], [40, 50], [10, 95], [55, 120]],
  },
  south_america: {
    cx: 410, cy: 590,
    poly: [
      [345, 445], [435, 450], [505, 515], [485, 610], [430, 710], [380, 760], [350, 680], [335, 560],
    ],
    offsets: [[-30, -90], [35, -80], [-40, -25], [40, -15], [-20, 35], [25, 45], [-10, 95], [5, 140]],
  },
  europe: {
    cx: 790, cy: 220,
    poly: [
      [680, 145], [765, 105], [885, 115], [915, 195], [875, 275], [785, 295], [705, 275], [665, 215],
    ],
    offsets: [[-65, -45], [5, -60], [70, -40], [-75, 15], [-5, 5], [70, 15], [-40, 55], [35, 55]],
  },
  africa: {
    cx: 815, cy: 505,
    poly: [
      [705, 355], [820, 345], [915, 405], [935, 500], [880, 620], [820, 695], [765, 645], [735, 525], [675, 440],
    ],
    offsets: [[-70, -95], [15, -100], [70, -55], [-80, -25], [-5, -15], [65, 20], [-15, 65], [10, 130]],
  },
  asia: {
    cx: 1185, cy: 275,
    poly: [
      [965, 135], [1140, 105], [1345, 125], [1465, 205], [1430, 315], [1335, 395], [1195, 430], [1045, 390], [975, 305], [945, 210],
    ],
    offsets: [[-145, -75], [-45, -85], [75, -75], [170, -25], [-130, 15], [-20, 25], [95, 35], [160, 85]],
  },
  oceania: {
    cx: 1320, cy: 615,
    poly: [
      [1215, 540], [1320, 520], [1425, 560], [1445, 650], [1365, 705], [1255, 690], [1195, 625],
    ],
    offsets: [[-75, -40], [0, -50], [75, -35], [-60, 15], [15, 10], [85, 25], [-25, 60], [65, 65]],
  },
  antarctica: {
    cx: 800, cy: 825,
    poly: [
      [390, 795], [650, 775], [960, 775], [1215, 795], [1190, 865], [810, 880], [420, 865],
    ],
    offsets: [[-300, -5], [-210, 12], [-115, -8], [-25, 10], [65, -8], [155, 12], [245, -5], [320, 10]],
  },
};

export function getContinentSlot(continentId: string, index: number) {
  const keys = Object.keys(CONTINENT_SHAPES);
  return CONTINENT_SHAPES[continentId] ?? CONTINENT_SHAPES[keys[index % keys.length]];
}
