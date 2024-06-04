import Sprite from "../../3d/Sprite";
import { SineAnimation } from "../../animation/SineAnimation";
import Invoker from "../../base/Invoker";
import { Defines } from '../../defines/defines';
import GamePrepareLogic from "./GamePrepareLogic";
import { LayoutComponent } from "./LayoutComponent";
import PlayerScore from "./PlayerScore";


/**
 * 显示玩家角色选择的角色小头像
 *
 * @export
 * @class PlayerCharacterThumb
 * @extends {LayoutComponent}
 */
export default class PlayerCharacterThumb extends LayoutComponent {
  private _player_id?: string;

  get player_id() { return this.args[0] || this._player_id || ''; }

  get character() { return this.lf2.player_characters.get(this.player_id) }

  get thumb_url(): string {
    return this.character?.data.base.small ?? Defines.BuiltIn.Imgs.CHARACTER_THUMB;
  }

  protected _opacity: SineAnimation = new SineAnimation(0.65, 1, 1 / 25);
  protected readonly _mesh_thumb = new Sprite()
    .set_center(.5, .5)
    .set_pos(this.layout.w / 2, -this.layout.h / 2, 0.1)
    .set_name('thumb')
    .apply();


  get gpl(): GamePrepareLogic | undefined {
    return this.layout.root.find_component(GamePrepareLogic)
  };

  protected _unmount_jobs = new Invoker();

  override on_resume(): void {
    super.on_resume();
    this._player_id = this.layout.find_component(PlayerScore)?.player_id
    this.layout.sprite.add(this._mesh_thumb);
    this._unmount_jobs.add(
      () => this.layout.sprite.del(this._mesh_thumb),
    )
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
    debugger
    const img = this.lf2.images.find(thumb_url)
    if (img) {
      const pic = this.lf2.images.create_pic_by_img_info(img);
      this._mesh_thumb.set_info(pic).apply();
    } else {
      this.lf2.images.create_pic(thumb_url, thumb_url).then(pic => {
        this._mesh_thumb.set_info(pic).apply();
      })
    }

  }
}