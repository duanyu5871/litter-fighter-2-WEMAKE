import { IStagePhaseInfo } from "./IStagePhaseInfo";

export interface IStageInfo {
  bg: string;
  id: string;
  name: string;
  phases: IStagePhaseInfo[];
  next?: string;
}
