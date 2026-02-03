// Color options for the filament color picker
export const COLOR_OPTIONS = [
  { name: 'Pink', color: 0xf06292, printColor: 0xf48fb1 },
  { name: 'Red', color: 0xe53935, printColor: 0xef5350 },
  { name: 'Green', color: 0x4caf50, printColor: 0x81c784 },
  { name: 'Blue', color: 0x2196f3, printColor: 0x64b5f6 },
  { name: 'Purple', color: 0xb39ddb, printColor: 0xd1c4e9 },
  { name: 'Orange', color: 0xff9800, printColor: 0xffb74d },
  { name: 'Yellow', color: 0xffc107, printColor: 0xffd54f }
];

// Default printer colors (pink, yellow, purple)
export const DEFAULT_PRINTER_COLORS = [
  { color: 0xf06292, printColor: 0xf48fb1 },
  { color: 0xffc107, printColor: 0xffd54f },
  { color: 0xb39ddb, printColor: 0xd1c4e9 }
];

// Section definitions for each printer
export const SECTIONS = [
  { id: 'about', title: 'About Me', color: 0xf06292, printColor: 0xf48fb1, position: { x: -5, y: 0, z: 0 } },
  { id: 'projects', title: 'Projects', color: 0xffc107, printColor: 0xffd54f, position: { x: 0, y: 0, z: 0 } },
  { id: 'contact', title: 'Contact', color: 0xb39ddb, printColor: 0xd1c4e9, position: { x: 5, y: 0, z: 0 } }
];

// Camera defaults
export const DEFAULT_CAMERA = {
  theta: Math.PI / 2,
  phi: Math.PI / 3,
  distance: 14,
  panX: 0
};

export const ZOOMED_CAMERA = {
  phi: Math.PI / 2.8,
  distance: 8
};

// Transition
export const TRANSITION_DURATION = 1300;

// Scene
export const BACKGROUND_COLOR = 0xf5efe4;
export const NAME_COLOR = 0xf58e2f;
