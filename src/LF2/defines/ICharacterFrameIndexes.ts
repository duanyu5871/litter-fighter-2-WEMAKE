import { TFrameIdListPair, TFrameIdPair } from ".";

export interface ICharacterFrameIndexes {
  landing_2: string;
  standing: string;
  running: string;
  heavy_obj_run: string;
  heavy_obj_walk: string[],
  landing_1: string;
  caughts: string[];
  catch_atk: string;
  catch: string[];
  throw_enemy: string;
  drink: string;
  l_weapen_thw: string;
  jump_weapen_atk: string;
  h_weapen_thw: string;
  air_weapon_thw: string;
  air_quick_rise: string[];
  dizzy: string;
  dash_weapen_atk: string;
  run_weapen_atk: string;
  weapen_atk: string[];
  picking_heavy: string;
  picking_light: string;
  // broken_defend: string;
  // defend_hit: string;
  in_the_sky: string[];
  super_punch: string;
  falling: TFrameIdListPair;
  bouncing: TFrameIdListPair;
  critical_hit: TFrameIdListPair;
  injured: TFrameIdPair;
  grand_injured: TFrameIdListPair;
  lying: TFrameIdPair;
  fire: string[];
  ice: string;
}
