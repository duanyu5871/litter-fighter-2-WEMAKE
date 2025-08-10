import { IUserInfo } from "./IUserInfo";

export interface IRoomInfo {
  title?: string;
  id?: string;
  master?: Required<IUserInfo>;
  users?: Required<IUserInfo>[];
  max_users?: number;
}
