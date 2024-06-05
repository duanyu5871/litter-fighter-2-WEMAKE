import Character from "../../entity/Character";
import { LayoutComponent } from "./LayoutComponent";
import PlayerScore from "./PlayerScore";

export default class PlayerScoreCell extends LayoutComponent {
  private _player_id?: string;
  get kind(): string { return this.args[0] }
  get player_id() { return this.args[1] || this._player_id || ''; }
  get character(): Character | undefined {
    return this.lf2.player_characters.get(this.player_id)
  }

  override on_resume(): void {
    super.on_resume();
    this._player_id = this.layout.lookup_component(PlayerScore)?.player_id;
  }

  override on_show(): void {
    super.on_show?.();
  }
}