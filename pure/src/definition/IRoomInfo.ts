import { IUserInfo } from "./IUserInfo";

export interface IRoomInfo {
  id?: number;
  master?: Required<IUserInfo>;
  users?: Required<IUserInfo>[];
}
