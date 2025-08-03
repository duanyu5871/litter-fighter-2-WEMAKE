import { Defines, type IStagePhaseInfo } from "../../defines";
import type { Entity } from "../../entity";
import type IEntityCallbacks from "../../entity/IEntityCallbacks";
import { is_character } from "../../entity/type_check";
import { IWorldCallbacks } from "../../IWorldCallbacks";
import type { Stage } from "../../stage";
import type IStageCallbacks from "../../stage/IStageCallbacks";
import { traversal } from "../../utils/container_help/traversal";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { UINode } from "../UINode";
import { Jalousie } from "./Jalousie";
import { OpacityAnimation } from "./OpacityAnimation";
import { Sounds } from "./Sounds";
import { UIComponent } from "./UIComponent";

export class VsModeLogic extends UIComponent
  implements IEntityCallbacks, IStageCallbacks, IWorldCallbacks {
  jalousie?: Jalousie;
  go_sounds!: Sounds;
  go_flashing!: OpacityAnimation;
  score_board!: UINode;
  override on_start(): void {
    super.on_start?.();
    this.score_board = this.node.find_child("score_board")!
    this.jalousie = this.node.search_component(Jalousie)
    this.go_sounds = this.node.search_component(Sounds, "go_sounds")!
    this.go_flashing = this.node.search_component(OpacityAnimation, "go_flashing")!
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
  override update(dt: number): void {
    if (this.jalousie && !this.jalousie.open && this.jalousie.anim.done) {
      this.lf2.goto_next_stage()
      this.jalousie.open = true;
    }
  }
  override on_key_down(e: IUIKeyEvent): void {
    if ((e.game_key === 'a' || e.game_key === 'j') && this.world.stage.is_chapter_finish) {
      e.stop_immediate_propagation();
      this.lf2.goto_next_stage();
    }
  }
  on_stage_change() {
    this.lf2.world.stage.callbacks.add(this);
    this.go_sounds.stop();
    this.go_flashing.stop();
    if (this.jalousie) this.jalousie.open = true;
  }
  on_phase_changed(
    stage: Stage,
    curr: IStagePhaseInfo | undefined,
    prev: IStagePhaseInfo | undefined,
  ) {
    this.debug('on_phase_changed', stage, curr, prev)
    if (stage.is_chapter_finish) return;
    this.score_board.visible = false;
    if (prev) {
      if (!curr) {
        this.go_flashing.loop.set(0, Number.MAX_SAFE_INTEGER);
      } else {
        this.go_flashing.loop.set(0, 1);
      }
      this.go_sounds.start()
      this.go_flashing.start();
    } else {
      this.go_sounds.stop()
      this.go_flashing.stop();
    }
  }
  on_chapter_finish(stage: Stage) {
    this.debug('on_chapter_finish', stage)
    this.lf2.sounds.play_preset("pass");
    this.score_board.visible = true;
  }
  on_requrie_goto_next_stage(stage: Stage) {
    this.debug('on_requrie_goto_next_stage', stage)
    if (this.jalousie) this.jalousie.open = false;
  }
  on_dead(e: Entity) {
    if (!is_character(e)) return;

    if (this.world.stage.data.id === Defines.VOID_STAGE.id) {

      // 各队伍存活计数
      const player_teams: { [x in string]?: number } = {};

      for (const [, f] of this.world.slot_fighters)
        player_teams[f.team] = 0 // 玩家队伍

      for (const e of this.world.entities) {
        if (is_character(e) && e.hp > 0 && player_teams[e.team] !== void 0)
          ++player_teams[e.team]!; // 存活计数++
      }

      // 剩余队伍数
      let team_remains = 0; 
      traversal(player_teams, (_, v) => {
        if (v) ++team_remains;
      })

      // 大于一队，继续打
      if (team_remains > 1) return;

      this.lf2.sounds.play_preset("end");
      this.score_board.visible = true;

    } else {
      // 玩家队伍存活计数
      const player_teams: { [x in string]?: number } = {};

      for (const [, f] of this.world.slot_fighters)
        player_teams[f.team] = 0 // 玩家队伍

      for (const e of this.world.entities) {
        if (is_character(e) && e.hp > 0 && player_teams[e.team] !== void 0)
          ++player_teams[e.team]!; // 存活计数++
      }

      // 剩余队伍数
      let team_remains = 0; 
      traversal(player_teams, (_, v) => {
        if (v) ++team_remains;
      })

      // 大于0队，继续打
      if (team_remains > 0) return;

      this.lf2.sounds.play_preset("end");
      this.score_board.visible = true;
    }
  }
}
