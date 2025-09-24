import { Difficulty } from "./Difficulty";
import { IStageObjectInfo } from "./IStageObjectInfo";

/**
 * 关卡阶段信息
 *
 * @export
 * @interface IStagePhaseInfo
 */
export interface IStagePhaseInfo {
  bound: number;
  player_l?: number;
  player_r?: number;
  camera_l?: number;
  camera_r?: number;
  enemy_l?: number;
  enemy_r?: number;
  drink_l?: number;
  drink_r?: number;

  desc?: string;
  objects: IStageObjectInfo[];
  music?: string;

  respawn?: { [x in Difficulty]?: number };

  /**
   *
   *
   * @type {number}
   * @memberof IStagePhaseInfo
   */
  health_up?: { [x in Difficulty]?: number },
  mp_up?: { [x in Difficulty]?: number },

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

  /**
   * 被打败后，加入队伍的血量
   * 
   * @type {?number}
   */
  join?: number;
}
