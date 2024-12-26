import type { Defines } from "./defines";
import type { IExpression } from "./IExpression";
import type { IFrameInfo } from "./IFrameInfo";
export interface INextFrameResult {
  frame: IFrameInfo;
  which: INextFrame;
}
export interface INextFrame {
  id?: string | string[];
  /**
 * 下一帧的持续时间策略
 * @date 2/23/2024 - 1:38:03 PM
 * 
 * 'i': 继承上一帧剩余事件; 
 * 
 * 'd':
 * 
 * 正数: 将会覆盖下一帧自带的wait
 *
 * @type {?(string | number)} 
 */
  wait?: string | number;

  /**
   * 下帧转向
   * @date 2/23/2024 - 1:37:05 PM
   *
   * @type {Defines.FacingFlag}
   */
  facing?: number;

  /**
   * 进入帧的判断表达式
   */
  expression?: string;

  judger?: IExpression<any>;

  /**
   * 进入此帧消耗的蓝量
   *
   * 原版中，消耗mp放在frame后面，```mp: N```
   * 
   * 从一个frame进入另一个frame有两种方式，其消耗mp的判断也不一致，如下
   *    - 通过hit进入的
   *      - N>0 耗mp
   *      - N<0 补mp
   *    - 通过next进入此动作
   *      - N>0 不耗mp
   *      - N<0 耗mp
   *    - 另外有N>1000时, 会消耗hp， N:4300 = 40hp, 300mp
   *    
   * 这与Wemake内部逻辑的八字不合。提取至INextFrame中可以方便我同时实现以上的需求
   * 
   * @type {?number}
   */
  mp?: number;

  /**
   * 进入此帧消耗的血量
   * 
   * 其他说明参见mp
   * 
   * @see {mp}
   * @type {?number}
   */
  hp?: number;


  /**
   * TODO
   *
   * @type {?string[]}
   */
  sounds?: string[];

  /**
   *
   *
   * @type {number}
   * @memberof INextFrame
   */
  blink_time?: number;
}
export type TNextFrame = INextFrame | INextFrame[]