import type { IStagePhaseInfo } from "../../defines";
import Ditto from "../../ditto";
import type { Entity } from "../../entity";
import type IEntityCallbacks from "../../entity/IEntityCallbacks";
import { is_character } from "../../entity/type_check";
import { IWorldCallbacks } from "../../IWorldCallbacks";
import type { Stage } from "../../stage";
import type IStageCallbacks from "../../stage/IStageCallbacks";
import { OpacityAnimation } from "./OpacityAnimation";
import { Sounds } from "./Sounds";
import { UIComponent } from "./UIComponent";

export class VsModeLogic extends UIComponent
  implements IEntityCallbacks, IStageCallbacks, IWorldCallbacks {
  override on_start(): void {
    super.on_start?.();
    for (const [, v] of this.lf2.player_characters) {
      v.callbacks.add(this);
    }
  }
  override on_stop(): void {
    super.on_stop?.();
    for (const [, v] of this.lf2.player_characters) {
      v.callbacks.del(this);
    }
  }
  override on_resume(): void {
    this.lf2.world.stage.callbacks.add(this);
    this.lf2.world.callbacks.add(this);
  }
  override on_pause(): void {
    this.lf2.world.stage.callbacks.del(this)
    this.lf2.world.callbacks.del(this);
  }
  on_stage_change() {
    this.lf2.world.stage.callbacks.add(this);
  }
  on_phase_changed(
    stage: Stage,
    curr: IStagePhaseInfo | undefined,
    prev: IStagePhaseInfo | undefined,
  ) {
    Ditto.Warn('on_phase_changed')
    const a = this.node.search_component(Sounds, "go_sounds")
    const b = this.node.search_component(OpacityAnimation, "go_flashing")
    if (prev) {
      if (!curr) {
        b!.loop.set(0, Number.MAX_SAFE_INTEGER);
      } else {
        b!.loop.set(0, 1);
      }
      a!.reset()
      a!.enabled = true
      b!.reset();
      b!.enabled = true;
    } else {
      a!.enabled = false
      b!.enabled = false;
    }

  }
  on_dead(e: Entity) {
    if (!is_character(e)) return;

    const team_alives = new Map<string, number>();
    for (const e of this.world.entities) {
      if (!is_character(e) || e.hp < 0) continue;
      const { team } = e;
      const count = team_alives.get(team);
      if (count && count > 1) return;
      team_alives.set(team, (count || 0) + 1);
    }
    if (team_alives.size > 1) return;

    const i = team_alives.get("") || 0;
    if (i > 1) return;

    this.lf2.sounds.play_preset("end");
    const score_board = this.node.find_child("score_board");
    if (score_board) score_board.visible = true;
  }

}
