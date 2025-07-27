import type { IStagePhaseInfo } from "../defines";
import type { Stage } from "./Stage";

export default interface IStageCallbacks {
  on_phase_changed?(
    stage: Stage,
    curr: IStagePhaseInfo | undefined,
    prev: IStagePhaseInfo | undefined,
  ): void;

  on_stage_finish?(stage: Stage): void;
  on_chapter_finish?(stage: Stage): void;
  on_requrie_goto_next_stage?(stage: Stage): void;
}
