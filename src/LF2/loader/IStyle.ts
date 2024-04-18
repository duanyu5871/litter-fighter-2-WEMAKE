export interface IStyle {
  lineCap?: CanvasLineCap;
  lineDashOffset?: number;
  lineJoin?: CanvasLineJoin;
  lineWidth?: number;
  miterLimit?: number;

  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  fillStyle?: string | CanvasGradient | CanvasPattern;
  strokeStyle?: string | CanvasGradient | CanvasPattern;

  direction?: CanvasDirection;
  font?: string;
  fontKerning?: CanvasFontKerning;
  fontStretch?: CanvasFontStretch;
  fontVariantCaps?: CanvasFontVariantCaps;
  letterSpacing?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  textRendering?: CanvasTextRendering;
  wordSpacing?: string;
}
