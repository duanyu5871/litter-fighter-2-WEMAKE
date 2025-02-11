import { IText } from "../../3d/IText";
import { SineAnimation } from "../../animation/SineAnimation";
import Invoker from "../../base/Invoker";
import Ditto from "../../ditto";
import Layout from "../Layout";
import { LayoutComponent } from "./LayoutComponent";

/**
 * 显示玩家角色选择的角色名称
 *
 * @export
 * @class PlayerCharacterHead
 * @extends {LayoutComponent}
 */
export default class PlayerCharacterName extends LayoutComponent {
  get player_id() {
    return this.args[0] || "";
  }
  get player() {
    return this.lf2.player_infos.get(this.player_id);
  }
  get decided() {
    return !!this.player?.character_decided;
  }
  get text(): string {
    const character_id = this.player?.character;
    const character = character_id
      ? this.lf2.datas.find_character(character_id)
      : void 0;
    return character?.base.name ?? "Random";
  }
  get joined(): boolean {
    return true === this.player?.joined;
  }
  get is_com(): boolean {
    return true === this.player?.is_com;
  }
  protected _mesh: IText;
  protected _opacity: SineAnimation = new SineAnimation(0.65, 1, 1 / 25);
  protected _unmount_jobs = new Invoker();
  constructor(layout: Layout, f_name: string) {
    super(layout, f_name);
    const [w, h] = this.layout.size;
    this._mesh = new Ditto.TextNode(this.lf2)
      .set_position(w / 2, -h / 2)
      .set_center(0.5, 0.5)
      .set_name(PlayerCharacterName.name)
      .set_style({
        fill_style: "white",
        font: "14px Arial",
      });
  }

  override on_resume(): void {
    super.on_resume();

    this.layout.sprite.add(this._mesh);
    this._unmount_jobs.add(
      this.player?.callbacks.add({
        on_is_com_changed: () => this.handle_changed(),
        on_joined_changed: () => this.handle_changed(),
        on_character_changed: () => this.handle_changed(),
        on_random_character_changed: () => this.handle_changed(),
      }),
      () => this._mesh.del_self(),
    );
    this.handle_changed();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  protected handle_changed() {
    this._mesh
      .set_style({
        ...this._mesh.style,
        fill_style: this.is_com ? "pink" : "white",
      })
      .set_visible(this.joined)
      .set_text(this.text)
      .apply();
  }

  override on_render(dt: number): void {
    this._opacity.update(dt);
    this._mesh.opacity = this.decided ? 1 : this._opacity.value;
  }
}
