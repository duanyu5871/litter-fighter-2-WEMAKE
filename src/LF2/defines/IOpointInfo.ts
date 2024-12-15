import type { TNextFrame, INextFrame } from ".";
export interface IOpointInfo {
  /**
   * 实体产生的X坐标（相对frame矩形左上角）
   * @type {number}
   */
  x: number;

  /**
   * 实体产生的Y坐标（相对frame矩形左上角）
   * @type {number}
   */
  y: number;

  /**
   * 实体数据ID
   *
   * @type {string}
   */
  oid: string;

  /**
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   * 
   * 生成物体处于哪一帧
   * 
   * - 在原版中：
   *    - action仅仅是个数字，指向某个帧.
   * 
   * - 在WEMAKE中：
   *    - action是INextFrame(或多个INextFrame)
   * 
   * @see {INextFrame}
   * @type {TNextFrame}
   */
  action: TNextFrame;

  dvx?: number;
  dvy?: number;
  dvz?: number;

  /**
   * 用于：
   * * [ ] LF2
   * * [X] WEMAKE
   * 
   * 生成数量。
   * 
   * - 在原版中：
   *    - 生成物体的数量是通过facing实现的，facing的十位数为数量，个位数为方向，0正向，1反向。
   * - 在WEMAKE中：
   *    - multi即代表生成数量，默认为1，若小于1，则什么都不会生成。
   *    - 生成的朝向见通过action的facing决定
   * 
   * @see {INextFrame.facing}
   * @type {?number}
   */
  multi?: number;

  max_hp?: number;
  hp?: number;
  max_mp?: number;
  mp?: number;

  speedz?: number;

  /**
   * 用于：
   * * [ ] LF2
   * * [X] WEMAKE
   * 
   * 扩散模式
   * 
   * 当multi大于1，扩散模式生效。
   * 
   */
  spreading?: number;
}
