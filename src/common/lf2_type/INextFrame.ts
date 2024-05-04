
export interface INextFrame {
  id?: string | string[];
  /**
 * 下一帧的持续时间策略
 * @date 2/23/2024 - 1:38:03 PM
 *
 * @type {?(string | number)} 'i': 继承上一帧剩余事件; number: 将会覆盖下一帧自带的wait
 */
  wait?: string | number;

  /**
   * 下帧转向
   * @date 2/23/2024 - 1:37:05 PM
   *
   * @type {Defines.FacingFlag}
   */
  facing?: number;
  expression?: string | ((e: any) => boolean);
}
