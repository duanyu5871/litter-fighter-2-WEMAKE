import type { CtrlDevice, TKeys } from "../controller";

export interface IPurePlayerInfo {
  id: string;
  name: string;
  keys: TKeys;
  team: string;
  character: string;
  version: number;
  ctrl: CtrlDevice;
}
