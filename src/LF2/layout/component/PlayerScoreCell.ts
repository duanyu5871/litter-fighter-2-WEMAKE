import Text from "../../3d/Text";
import { LayoutComponent } from "./LayoutComponent";
import PlayerScore from "./PlayerScore";

export default class PlayerScoreCell extends LayoutComponent {
  get kind() { return this.args[0] }
  get player_score() { return this.layout.lookup_component(PlayerScore) }

  override on_resume(): void {
    super.on_resume();

  }
  vvv() {
    switch (this.kind) {
      case 'kill': return 'kill';
      case 'attack': return 'attack';
      case 'hp_lost': return '' + this.player_score?.hp_lost;
      case 'mp_usage': return '' + this.player_score?.mp_usage;
      case 'picking': return 'picking';
      case 'status': return 'status';
    }
    return ''
  }
  override on_show(): void {
    super.on_show?.();
    this.layout.sprite.add(
      new Text(this.lf2)
        .set_center(0.5, 0.5)
        .set_style(this.layout.style)
        .set_text(this.vvv())
        .apply()
    )
  }
}