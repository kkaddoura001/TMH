declare module "cobe" {
  type RGB = [number, number, number];

  interface GlobeOptions {
    devicePixelRatio?: number;
    width: number;
    height: number;
    phi?: number;
    theta?: number;
    dark?: number;
    diffuse?: number;
    mapSamples?: number;
    mapBrightness?: number;
    baseColor?: RGB;
    markerColor?: RGB;
    glowColor?: RGB;
    markerElevation?: number;
    markers?: Array<{ location: [number, number]; size: number }>;
    arcs?: Array<{ from: [number, number]; to: [number, number] }>;
    arcColor?: RGB;
    arcWidth?: number;
    arcHeight?: number;
    opacity?: number;
    onRender?: (state: Record<string, unknown>) => void;
  }

  interface Globe {
    destroy(): void;
  }

  export default function createGlobe(
    canvas: HTMLCanvasElement,
    options: GlobeOptions
  ): Globe;
}
