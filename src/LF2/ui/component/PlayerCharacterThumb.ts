import { ISprite } from "../../3d";
import { Sine } from "../../animation/Sine";
import Invoker from "../../base/Invoker";
import { Defines } from "../../defines/defines";
import Ditto from "../../ditto";
import type { UINode } from "../UINode";
import GamePrepareLogic from "./GamePrepareLogic";
import { UIComponent } from "./UIComponent";
import PlayerScore from "./PlayerScore";

/**
 * 显示玩家角色选择的角色小头像
 *
 * @export
 * @class PlayerCharacterThumb
 * @extends {UIComponent}
 */
export default class PlayerCharacterThumb extends UIComponent {
  private _player_id?: string;

  get player_id() {
    return this.args[0] || this._player_id || "";
  }

  get character() {
    return this.lf2.player_characters.get(this.player_id);
  }

  get thumb_url(): string {
    return (
      this.character?.data.base.small ?? Defines.BuiltIn_Imgs.CHARACTER_THUMB
    );
  }

  protected _opacity: Sine = new Sine(0.65, 1, 3);
  protected readonly _mesh_thumb: ISprite;

  get gpl(): GamePrepareLogic | undefined {
    return this.node.root.find_component(GamePrepareLogic);
  }

  protected _unmount_jobs = new Invoker();

  constructor(layout: UINode, f_name: string) {
    super(layout, f_name);
    this._mesh_thumb = new Ditto.SpriteNode(this.lf2)
      .set_center(0.5, 0.5)
      .set_position(this.node.w / 2, -this.node.h / 2, 0.1)
      .set_name("thumb")
      .apply();
  }
  override on_resume(): void {
    super.on_resume();
    this._player_id = this.node.lookup_component(PlayerScore)?.player_id;
    this.node.renderer.sprite.add(this._mesh_thumb);
    this._unmount_jobs.add(() => this.node.renderer.sprite.del(this._mesh_thumb));
  }

  override on_show(): void {
    this.handle_changed();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  protected handle_changed() {
    const { thumb_url } = this;
    const img = this.lf2.images.find(thumb_url);
    if (img) {
      const pic = this.lf2.images.create_pic_by_img_info(img);
      this._mesh_thumb.set_info(pic).apply();
    } else {
      this.lf2.images.create_pic(thumb_url, thumb_url).then((pic) => {
        this._mesh_thumb.set_info(pic).apply();
      });
    }
  }
}
