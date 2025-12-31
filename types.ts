
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedFace {
  box2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  label: string;
}

export type AppState = 'upload' | 'editor' | 'preview';

export type ExportFormat = 'png' | 'jpeg';
