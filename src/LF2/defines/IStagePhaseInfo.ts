import { IStageObjectInfo } from "./IStageObjectInfo";

/**
 * 关卡阶段信息
 *
 * @export
 * @interface IStagePhaseInfo
 */
export interface IStagePhaseInfo {
  bound: number;
  desc?: string;
  objects: IStageObjectInfo[];
  music?: string;

  /**
   * 相机跳至位置
   *
   * @type {?number}
   */
  cam_jump_to_x?: number;

  /**
   * 玩家跳至位置
   *
   * @type {?number}
   */
  player_jump_to_x?: number;

  /**
   * 阶段结束判定
   *
   * 默认是场上无敌人
   *
   * @type {?string}
   */
  end_condition?: string;

  /**
   * 阶段结束动作
   *
   * 默认是进入下一阶段
   *
   * @type {?string}
   */
  end_action?: string;
}
