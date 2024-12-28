import { TFrameIdListPair, TFrameIdPair } from ".";

export interface IFrameIndexes {
  standing?: string;
  heavy_obj_walk?: string[];
  landing_2?: string;
  landing_1?: string;
  dizzy?: string;
  picking_heavy?: string;
  picking_light?: string;
  in_the_sky?: string;
  falling?: TFrameIdListPair;

  /**
   * 速度叫快的摔到地上时，需要弹起来
   *
   * - "-1": 角色面部朝上
   * - "1": 角色面部朝下
   */
  bouncing?: TFrameIdListPair;

  critical_hit?: TFrameIdListPair;
  injured?: TFrameIdPair;
  grand_injured?: TFrameIdListPair;
  lying?: TFrameIdPair;
  fire?: string[];
  ice?: string;

  throwing?: string;

  on_ground?: string;

  just_on_ground?: string;

  /**
   * for weapon
   *
   * @type {string}
   */
  throw_on_ground?: string;
}
