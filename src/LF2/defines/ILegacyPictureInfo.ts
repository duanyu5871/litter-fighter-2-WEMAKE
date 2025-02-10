/**
 * 实体图片信息
 *
 * TODO 补充说明
 *
 * @export
 * @interface ILegacyPictureInfo
 */

export interface ILegacyPictureInfo {
  id: string;

  path: string;

  /**
   * 行数
   *
   * @type {number}
   */
  row: number;

  /**
   * 列数
   *
   * @type {number}
   */
  col: number;

  /**
   * 格宽
   *
   * @type {number}
   */
  cell_w: number;

  /**
   * 格高
   *
   * @type {number}
   */
  cell_h: number;

  variants?: string[];
}
