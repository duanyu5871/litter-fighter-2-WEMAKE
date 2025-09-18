import { IStagePhaseInfo } from "./IStagePhaseInfo";
/**
 * 关卡信息
 */
export interface IStageInfo {
  /**
   * 关卡使用的背景
   */
  bg: string;
  id: string;
  name: string;
  phases: IStagePhaseInfo[];
  next?: string;
  chapter?: string;

  /**
   * 关卡结束判定
   *
   * 默认是全部阶段已结束
   *
   * @type {?string}
   */
  cond_end?: string;

  /**
   * 关卡结束后，如何才进入下一关卡
   *
   * 默认是玩家跑到场景的最右边
   *
   * @type {?string}
   */
  act_of_goto_next?: string;

  /**
   * 是否为首个小关
   */
  is_starting?: boolean;

  /**
   * 起点名称
   */
  starting_name?: string;
  
  title?: string;
}
