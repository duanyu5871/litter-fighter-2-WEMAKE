export interface IBgLayerInfo {
  file?: string;
  absolute?: number;
  color?: number | string;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  /** 
   * x轴循环布置间隔距离
   */
  loop?: number;
  cc?: number;
  c1?: number;
  c2?: number;
}
