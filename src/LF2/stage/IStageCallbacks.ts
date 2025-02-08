import type { IStagePhaseInfo } from "../defines";
import type Stage from "./Stage";

export default interface IStageCallbacks {
  on_phase_changed?(
    stage: Stage,
    curr: IStagePhaseInfo | undefined,
    prev: IStagePhaseInfo | undefined,
  ): void;
}
