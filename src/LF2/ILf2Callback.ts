import type { Difficulty } from "./defines";
import type { IZip } from "./ditto";
import type { PlayerInfo } from "./PlayerInfo";
import type { UIComponent } from "./ui/component/UIComponent";
import type { ICookedUIInfo } from "./ui/ICookedUIInfo";
import type { UINode } from "./ui/UINode";

export interface ILf2Callback {
  on_layout_changed?(
    layout: UINode | undefined,
    prev_layout: UINode | undefined,
  ): void;

  on_loading_start?(): void;
  on_loading_end?(): void;
  on_loading_failed?(reason: any): void;

  on_loading_content?(content: string, progress: number): void;

  on_bgms_loaded?(names: string[]): void;
  on_bgms_clear?(): void;

  on_player_infos_changed?(player_infos: PlayerInfo[]): void;
  on_cheat_changed?(cheat_name: string, enabled: boolean): void;

  on_stage_pass?(): void;
  on_enter_next_stage?(): void;

  on_dispose?(): void;
  on_ui_loaded?(ui_infos: ICookedUIInfo[]): void;
  on_prel_loaded?(): void;

  on_broadcast?(message: string): void;

  on_zips_changed?(zips: IZip[]): void;

  on_component_broadcast?(component: UIComponent, message: string): void;
}
