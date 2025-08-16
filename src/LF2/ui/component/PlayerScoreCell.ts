import IStyle from "../../defines/IStyle";
import { ui_load_txt } from "../ui_load_txt";
import PlayerScore from "./PlayerScore";
import { UIComponent } from "./UIComponent";
export default class PlayerScoreCell extends UIComponent {
  get kind() {
    return this.args[0];
  }
  get player_score() {
    return this.node.lookup_component(PlayerScore);
  }

  override on_show(): void {
    super.on_show?.();
    ui_load_txt(this.lf2, {
      i18n: this.get_txt(), style: this.get_style()
    }).then(v => {
      this.node.txts.value = v;
      this.node.txt_idx.value = 0;
      const { w, h, scale } = v[0]!
      this.node.size.value = [w / scale, h / scale];
    })
  }

  protected get_style(): IStyle {
    const s = this.player_score;
    const c = this.player_score?.character;
    if (!s || !c) return this.node.style;
    if (this.kind === "status") {
      let clr = this.node.style.fill_style;
      if (c.hp > 0) clr = this.node.get_value("win_alive_color");
      else if (s.lose) clr = this.node.get_value("lose_color");
      else clr = this.node.get_value("win_dead_color");
      return { ...this.node.style, fill_style: clr };
    }
    return this.node.style;
  }
  protected get_txt() {
    const s = this.player_score;
    const c = this.player_score?.character;
    if (!s || !c) return "-";
    switch (this.kind) {
      case "kill":
        return "" + c.kill_sum;
      case "attack":
        return "" + c.damage_sum;
      case "hp_lost":
        return "" + s.hp_lost;
      case "mp_usage":
        return "" + s.mp_usage;
      case "picking":
        return "" + c.picking_sum;
      case "status": {
        if (c.hp > 0) return this.node.get_value("win_alive_txt");
        else if (s.lose) return this.node.get_value("lose_txt");
        else return this.node.get_value("win_dead_txt");
      }
    }
    return "-";
  }
}
