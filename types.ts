export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type PageSize = 'a4' | 'legal';
export type Orientation = 'portrait' | 'landscape';

/**
 * Filter configuration for floating image elements.
 */
export interface ImageFilters {
  brightness: number;
  contrast: number;
  grayscale: number;
  sepia: number;
  blur: number;
  saturate: number;
  hueRotate: number;
  invert: number;
}

/**
 * Represents a dynamic, draggable element on the canvas (text or image).
 */
export interface TableCell {
  id: string;
  content: string;
}

export interface FloatingElement {
  id: string;
  type: 'text' | 'image' | 'table';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  fontSize?: string;
  fontFamily?: string;
  filters?: ImageFilters;
  objectFit?: 'cover' | 'contain' | 'fill';
  tableData?: {
    rows: {
      id: string;
      cells: TableCell[];
    }[];
    columnWidths: number[];
    rowHeights: number[];
  };
}

export interface TextStylePreset {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  outlineColor: string;
  outlineWidth: string;
}

export interface WatermarkSettings {
  text: string;
  opacity: number;
  rotation: number;
  fontSize: number;
  enabled: boolean;
}

export interface DocumentState {
  title: string;
  content: string;
  fontSize: string;
  fontColor: string;
  backgroundColor: string;
  fontFamily: string;
  lineHeight: string;
  letterSpacing: string;
  margin: number; // in mm
  pageSize: PageSize;
  orientation: Orientation;
  elements: FloatingElement[];
  presets?: TextStylePreset[];
  watermark?: WatermarkSettings;
}