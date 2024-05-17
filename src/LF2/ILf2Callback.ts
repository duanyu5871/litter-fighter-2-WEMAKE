import Layout from '../LF2/layout/Layout';
import { IStageInfo } from "./defines/IStageInfo";
import { Defines } from './defines/defines';
import { PlayerInfo } from './PlayerInfo';


export interface ILf2Callback {
  on_layout_changed?(layout: Layout | undefined, prev_layout: Layout | undefined): void;

  on_loading_start?(): void;
  on_loading_end?(): void;
  on_loading_failed?(reason: any): void;



  on_loading_content?(content: string, progress: number): void;

  on_stages_loaded?(stages: IStageInfo[]): void;
  on_stages_clear?(): void;

  on_bgms_loaded?(names: string[]): void;
  on_bgms_clear?(): void;

  on_player_infos_changed?(player_infos: PlayerInfo[]): void;
  on_cheat_changed?(cheat_name: string, enabled: boolean): void;

  on_stage_pass?(): void;
  on_enter_next_stage?(): void;

  on_dispose?(): void;
  on_difficulty_changed?(value: Defines.Difficulty, prev: Defines.Difficulty): void;

  on_layouts_loaded?(): void;
}
