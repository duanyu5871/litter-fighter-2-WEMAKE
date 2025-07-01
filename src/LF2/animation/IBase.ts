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

  /**
   * 动画进度
   *
   * @readonly
   * @type {number}
   */
  time: number

  /**
   * 是否反向播放
   *
   * @type {boolean}
   * @memberof IBase
   */
  reverse: boolean;

  /**
   * 计算当前值
   * 
   * 此函数中应该计算value
   *
   * @return {this}
   * @memberof IBase
   */
  calc(): this;

  /**
   *
   *
   * @param {boolean} [reverse]
   * @memberof IBase
   */
  end(reverse?: boolean): void;
}
export type IAnimation = IBase;
export default IAnimation