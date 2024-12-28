import type { Defines, INextFrame, TNextFrame } from ".";
import type { OpointKind } from "./OpointKind";
import { OpointMultiEnum } from "./OpointMultiEnum";
export interface IOpointInfo {

  /**
   *
   * @type {number}
   * @memberof IOpointInfo
   * @see {OpointKind}
   */
  kind: number;

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
   * @type {string | string[]}
   */
  oid: string | string[];

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
   *    - 生成物体的数量是通过facing实现的，facing的十位数以上为数量（数量=facing整除10）
   *    - 个位数为方向，0表示与发射者朝向相同，1表示与发射者朝向相反
   * 
   * - 在WEMAKE中：
   *    - multi即代表生成数量，默认为1，若小于1，则什么都不会生成。
   *    - 生成物的朝向见通过action的facing决定
   * 
   * @see {INextFrame.facing}
   * @see {Defines.FacingFlag}
   * @type {?number}
   */
  multi?: number | { type: OpointMultiEnum, min: number };

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
