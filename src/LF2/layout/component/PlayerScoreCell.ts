import { LayoutComponent } from "./LayoutComponent";
import PlayerScore from "./PlayerScore";

export default class PlayerScoreCell extends LayoutComponent {
  private _player_id?: string;
  
  get player_id() { return this.args[1] || this._player_id || ''; }

  override on_resume(): void {
    super.on_resume();
    this._player_id = this.layout.find_component(PlayerScore)?.player_id
  }
}