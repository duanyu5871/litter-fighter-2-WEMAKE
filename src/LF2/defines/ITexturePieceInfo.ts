
export interface ITexturePieceInfo {
  /** 纹理ID */
  tex: number | string;

  pixel_w: number;

  pixel_h: number;

  /** 纹理裁剪起点（x），-1 ~ 1 */
  x: number;

  /** 纹理裁剪起点（y），0 ~ 1 */
  y: number;

  /** 纹理裁剪宽度比，0 ~ 1 */
  w: number;

  /**
   * 纹理裁剪高度比
   * 正常范围：0 ~ 1
   */
  h: number;
}
