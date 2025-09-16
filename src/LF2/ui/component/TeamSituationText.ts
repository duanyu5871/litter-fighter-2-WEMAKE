import { get_team_text_color } from "../../base/get_team_text_color";
import IStyle from "../../defines/IStyle";
import { TeamEnum } from "../../defines/TeamEnum";
import { Stage } from "../../stage";
import { floor, max } from "../../utils";
import { ui_load_txt } from "../ui_load_txt";
import { ITeamSumInfo } from "./ITeamSumInfo";
import { SummaryLogic } from "./SummaryLogic";
import { UIComponent } from "./UIComponent";

export class TeamSituationText extends UIComponent {
  static override readonly TAG = "TeamSituationText"
  private _team: string | null = null;
  private _style: IStyle = {
    fill_style: 'white',
    font: "12px Arial",
    line_width: 1,
    disposable: true
  };
  private _sum: ITeamSumInfo | undefined;
  private _text: string = ' ';

  override on_start(): void {
    super.on_start?.();
    this._team = this.str(0);
    if (this._team) {
      this.set_team(this._team)
    } else {
      this.world.callbacks.add(this)
      this.on_stage_change(this.world.stage)
    }
  }
  override on_stop(): void {
    if (!this._team) {
      this.world.callbacks.del(this)
    }
  }
  set_team(team: string) {
    this._style = {
      fill_style: get_team_text_color(team, get_team_text_color(TeamEnum.Team_2)),
      font: "12px Arial",
      line_width: 1,
      disposable: true
    }
    this._sum = this.node.root.search_component(SummaryLogic)?.team_sum(team)
    this.rr();
  }
  on_stage_change(curr: Stage) {
    this.set_team(curr.team)
  }

  override on_resume(): void {
    super.on_resume()
    this.rr();
  }

  override update(dt: number): void {
    if (this.world.time % 30 === 0) this.rr();
  }

  private rr() {
    if (!this._sum) return;
    let text = `Man: ${this._sum.lives}　HP: ${max(0,floor(this._sum.hp))}`;
    if (this._sum.reserve) text += `　Reserve: ${this._sum.reserve}`;
    if (this._text == text) return;

    ui_load_txt(this.lf2, { i18n: this._text = text, style: this._style }).then(v => {
      this.node.txts.value = v;
      this.node.txt_idx.value = 0;
      const { w, h, scale } = v[0]!;
      this.node.size.value = [w / scale, h / scale];
    });

  }
}
