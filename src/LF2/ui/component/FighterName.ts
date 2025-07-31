import { IText } from "../../3d/IText";
import { Sine } from "../../animation/Sine";
import Invoker from "../../base/Invoker";
import Ditto from "../../ditto";
import { PlayerInfo } from "../../PlayerInfo";
import { ui_load_txt } from "../ui_load_txt";
import type { UINode } from "../UINode";
import { UIComponent } from "./UIComponent";

/**
 * 显示玩家角色选择的角色名称
 *
 * @export
 * @class FighterName
 * @extends {UIComponent}
 */
export default class FighterName extends UIComponent {
  static override readonly TAG = 'FighterName'
  get player_id() { return this.args[0] || ""; }
  get player(): PlayerInfo { return this.lf2.players.get(this.player_id)! }
  get decided() {
    return !!this.player.character_decided;
  }
  get text(): string {
    const character_id = this.player.character;
    const character = character_id
      ? this.lf2.datas.find_character(character_id)
      : void 0;
    return character?.base.name ?? "Random";
  }
  get joined(): boolean {
    return true === this.player.joined;
  }
  get is_com(): boolean {
    return true === this.player.is_com;
  }
  // protected _mesh: IText;
  protected _opacity: Sine = new Sine(0.65, 1, 6);
  protected _unmount_jobs = new Invoker();
  constructor(layout: UINode, f_name: string) {
    super(layout, f_name);
    // const [w, h] = this.node.size.value;
    // this._mesh = new Ditto.TextNode(this.lf2)
    //   .set_position(w / 2, -h / 2)
    //   .set_center(0.5, 0.5)
    //   .set_name(FighterName.name)
    //   .set_style({
    //     fill_style: "white",
    //     font: "14px Arial",
    //   });
  }

  override on_resume(): void {
    super.on_resume();

    // this.node.renderer.sprite.add(this._mesh);
    this._unmount_jobs.add(
      this.player.callbacks.add({
        on_is_com_changed: () => this.handle_changed(),
        on_joined_changed: () => this.handle_changed(),
        on_character_changed: () => this.handle_changed(),
        on_random_character_changed: () => this.handle_changed(),
      }),
      // () => this._mesh.del_self(),
    );
    this.handle_changed();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  protected handle_changed() {
    ui_load_txt(this.lf2, {
      value: this.text, style: {
        fill_style: this.is_com ? "pink" : "white",
        font: "14px Arial",
      }
    }).then(v => {
      this.node.txts.value = v;
      this.node.txt_idx.value = 0;
      const { w, h, scale } = v[0]!
      this.node.size.value = [w / scale, h / scale];
    })
    this.node.set_visible(this.joined)
  }

  override update(dt: number): void {
    this._opacity.update(dt);
    this.node.opacity = this.decided ? 1 : this._opacity.value;
  }
}
