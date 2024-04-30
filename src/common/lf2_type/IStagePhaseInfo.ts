import { IStageObjectInfo } from "./IStageObjectInfo";

export interface IStagePhaseInfo {
  bound: number;
  desc: string;
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
}
