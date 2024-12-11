import IEntityCallbacks from "../../entity/IEntityCallbacks";
import { is_character } from "../../entity/type_check";
import { LayoutComponent } from "./LayoutComponent";

export default class VsModeLogic extends LayoutComponent implements IEntityCallbacks {
  override on_start(): void {
    super.on_start?.()
    for (const [, v] of this.lf2.player_characters) {
      v.callbacks.add(this)
    }
  }
  override on_stop(): void {
    super.on_stop?.()
    for (const [, v] of this.lf2.player_characters) {
      v.callbacks.del(this)
    }
  }

  on_dead() {
    const team_alives = new Map<string, number>()
    for (const e of this.world.entities) {
      if (!is_character(e) || e.hp < 0) continue;
      const { team } = e
      const count = team_alives.get(team)
      if (count && count > 1) return;
      team_alives.set(team, (count || 0) + 1);
    }
    if (team_alives.size > 1) return;

    const i = team_alives.get('') || 0;
    if (i > 1) return;
    this.lf2.sounds.play_preset('end');

    const score_board = this.layout.find_layout('score_board');
    if (score_board) score_board.visible = true;
  }

  override on_show(): void {
  }
}