import type { IFrameInfo } from "./IFrameInfo";
export interface IAiRay {
  x: number;
  z: number;
  min_x?: number;
  max_x?: number;
  min_z?: number;
  max_z?: number;
  min_d?: number;
}
export interface IAiAction {
  desire?: number;
  e_ray?: IAiRay[]
  a_ray?: IAiRay[]
}
export interface IAiData {
  id?: string;
  states?: { [x in IFrameInfo['state']]: IAiAction[] };
  frames?: { [x in IFrameInfo['id']]: IAiAction[] };
  w_atk_zone_x?: number
  w_atk_zone_z?: number
  r_atk_zone_x?: number
  r_atk_zone_z?: number
  d_atk_zone_x?: number
  d_atk_zone_z?: number
  jump_desire?: number
  run_desire?: number
  dash_desire?: number
  stop_run_desire?: number
  run_zone?: number
}
