import type { IStagePhaseInfo } from "../../common/lf2_type/IStagePhaseInfo";
import type Stage from "./Stage";

export default interface IStageCallbacks {
  on_phase_changed?(
    stage: Stage,
    curr: IStagePhaseInfo | undefined,
    prev: IStagePhaseInfo | undefined
  ): void;
}
