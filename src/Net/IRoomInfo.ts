import { IPlayerInfo } from "./IPlayerInfo";

export interface IRoomInfo {
  title?: string;
  id?: string;
  owner?: Required<IPlayerInfo>;
  players?: Required<IPlayerInfo>[];
  max_players?: number;
}
