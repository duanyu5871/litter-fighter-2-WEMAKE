import { IUserInfo } from "./IUserInfo";

export interface IRoomInfo {
  id?: string;
  master?: Required<IUserInfo>;
  users?: Required<IUserInfo>[];
}
