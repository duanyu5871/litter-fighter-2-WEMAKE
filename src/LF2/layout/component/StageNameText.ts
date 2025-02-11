import { IText } from "../../3d/IText";
import Invoker from "../../base/Invoker";
import { CheatType, IStageInfo } from "../../defines";
import { Defines } from "../../defines/defines";
import Ditto from "../../ditto";
import Layout from "../Layout";
import { LayoutComponent } from "./LayoutComponent";

export default class StageNameText extends LayoutComponent {
  private _stage: IStageInfo = Defines.VOID_STAGE;

  get show_all(): boolean {
    return this.lf2.is_cheat_enabled(CheatType.GIM_INK);
  }

  get stages(): IStageInfo[] {
    const ret =
      this.lf2.stages?.filter((v) => v.id !== Defines.VOID_STAGE.id) || [];
    if (this.show_all) return ret;
    return ret.filter((v) => v.is_starting);
  }

  get stage(): IStageInfo {
    return this._stage;
  }
  get text(): string {
    if (this.show_all) return this._stage.name;
    return this._stage.starting_name ?? this._stage.name;
  }
  protected _mesh: IText;
  protected _unmount_jobs = new Invoker();

  constructor(layout: Layout, f_name: string) {
    super(layout, f_name);
    this._mesh = new Ditto.TextNode(this.lf2)
      .set_center(0.5, 0.5)
      .set_name(StageNameText.name)
      .set_style({
        fill_style: "#9b9bff",
        font: "14px Arial",
      });
  }

  override on_resume(): void {
    super.on_resume();
    this.switch_stage();
    this.layout.sprite.add(this._mesh);
    this._unmount_jobs.add(
      this.lf2.callbacks.add({
        on_broadcast: (v) => {
          if (v === Defines.BuiltIn_Broadcast.SwitchStage) this.switch_stage();
        },
        on_cheat_changed: () => this.switch_stage(),
        on_loading_end: () => this.switch_stage(),
      }),
      () => this._mesh.del_self(),
    );
    this._mesh.set_text(this.text).apply();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  protected switch_stage() {
    const { stages } = this;
    if (!stages.length) {
      this._stage = Defines.VOID_STAGE;
      return;
    }
    const state_id = this.stage.id;
    const curr_idx = stages.findIndex((v) => v.id === state_id);
    const next_idx = (curr_idx + 1) % stages.length;
    this._stage = stages[next_idx];
    this._mesh.set_text(this.text).apply();
  }
}
