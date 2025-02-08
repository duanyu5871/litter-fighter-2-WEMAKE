export interface IBase {

  /**
   * 当前值
   *
   * @readonly
   * @type {number}
   */
  value: number;

  /**
   * 动画时长
   *
   * @readonly
   * @type {number}
   */
  duration: number;

  reverse: boolean;

  time: number

  calc(): this;
  end(reverse?: boolean): void;
}
export type IAnimation = IBase;
export default IAnimation