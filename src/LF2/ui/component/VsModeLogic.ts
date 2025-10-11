import { GameKey, GONE_FRAME_INFO } from "../../defines";
import type { Entity } from "../../entity";
import type IEntityCallbacks from "../../entity/IEntityCallbacks";
import { is_character } from "../../entity/type_check";
import { traversal } from "../../utils/container_help/traversal";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { UINode } from "../UINode";
import { UIComponent } from "./UIComponent";

export class VsModeLogic extends UIComponent {
  static override readonly TAG = 'VsModeLogic'
  protected score_board?: UINode;
  protected is_game_over: boolean = false;
  protected game_over_time: number = Number.MAX_SAFE_INTEGER;
  protected cancellers: (() => void)[] = []
  protected fighter_callbacks: IEntityCallbacks = {
    on_dead: (e: Entity) => {
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
      this.game_over_time = this.world.time;
    }
  }
  protected reset() {
    this.game_over_time = Number.MAX_SAFE_INTEGER;
    this.is_game_over = false;
    this.world.paused = false;
    this.world.playrate = 1;
    this.world.infinity_mp = false;
  }
  override on_start(): void {
    super.on_start?.();
    this.score_board = this.node.find_child("score_board")!
    for (const [, f] of this.world.slot_fighters)
      this.cancellers.push(f.callbacks.add(this.fighter_callbacks))
    this.reset()
  }
  override on_stop(): void {
    this.world.entities.forEach(v => {
      v.enter_frame(GONE_FRAME_INFO)
      v.next_frame = GONE_FRAME_INFO
    })
    for (const func of this.cancellers) func()
    this.cancellers.length = 0;
  }
  override update(dt: number): void {
    if (
      !this.is_game_over &&
      this.world.time - this.game_over_time > 3000
    ) {
      this.lf2.sounds.play_preset("end");
      if (this.score_board) this.score_board.visible = true;
      this.game_over_time = Number.MAX_SAFE_INTEGER;
      this.is_game_over = true;
    }
  }
  override on_key_down(e: IUIKeyEvent): void {
    switch (e.game_key) {
      case GameKey.a:
      case GameKey.j: {
        if (this.is_game_over) {
          e.stop_immediate_propagation();
          this.lf2.pop_ui()
        }
        break;
      }
    }
  }
}
