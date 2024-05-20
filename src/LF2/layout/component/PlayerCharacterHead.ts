import { SineAnimation } from "../../animation/SineAnimation";
import { Defines } from '../../defines/defines';
import Invoker from "../../base/Invoker";
import GamePrepareLogic, { GamePrepareState } from "./GamePrepareLogic";
import { LayoutComponent } from "./LayoutComponent";
import Sprite from "../../3d/Sprite";


/**
 * 显示玩家角色选择的角色头像
 *
 * @export
 * @class PlayerCharacterHead
 * @extends {LayoutComponent}
 */
export default class PlayerCharacterHead extends LayoutComponent {
  get player_id() { return this.args[0] || '' }
  get player() { return this.lf2.player_infos.get(this.player_id) }

  get head() {
    const character_id = this.player?.character;
    if (!character_id) return Defines.BuiltIn.Imgs.RFACE;
    const head = this.lf2.datas.find_character(character_id)?.base.head
    return head ?? Defines.BuiltIn.Imgs.RFACE;
  }

  protected _opacity: SineAnimation = new SineAnimation(0.65, 1, 1 / 25);
  protected readonly _mesh_head = new Sprite()
    .set_center(.5, .5)
    .set_pos(this.layout.w / 2, -this.layout.h / 2, 0.1)
    .set_name('head')
    .apply();
  protected readonly _mesh_hints = new Sprite()
    .set_center(.5, .5)
    .set_pos(this.layout.w / 2, -this.layout.h / 2, 0.1)
    .set_name('hints')
    .apply();
  protected readonly _mesh_cd = new Sprite()
    .set_center(.5, .5)
    .set_pos(this.layout.w / 2, -this.layout.h / 2, 0.1)
    .set_name('countdown');

  get gpl(): GamePrepareLogic | undefined {
    return this.layout.root.find_component(GamePrepareLogic)
  };
  get joined(): boolean { return !!this.player?.joined }

  protected _unmount_jobs = new Invoker();

  override on_mount(): void {
    super.on_mount();
    const hint_pic = this.lf2.images.create_pic_by_img_key(Defines.BuiltIn.Imgs.CMA);
    this._mesh_hints
      .set_info(hint_pic)
      .set_visible(!this.player?.joined)
      .apply();
    this.layout.sprite.add(
      this._mesh_cd,
      this._mesh_hints,
      this._mesh_head
    );
    this._unmount_jobs.add(
      () => this.layout.sprite.del(
        this._mesh_cd,
        this._mesh_hints,
        this._mesh_head
      ),
      this.player?.callbacks.add({
        on_joined_changed: () => this.handle_changed(),
        on_character_changed: () => this.handle_changed(),
        on_random_character_changed: () => this.handle_changed(),
      }),
      this.gpl?.callbacks.add({
        on_countdown: (seconds) => {
          const pic = this.lf2.images.create_pic_by_img_key(`sprite/CM${seconds}.png`);
          this._mesh_cd.set_info(pic).apply();
        },
      }),
      this.gpl?.fsm.callbacks.add({
        on_state_changed: () => this.handle_changed()
      })
    )
  }

  override on_unmount(): void {
    super.on_unmount();
    this._unmount_jobs.invoke();
    this._unmount_jobs.clear();
  }

  protected handle_changed() {
    const pic = this.lf2.images.create_pic_by_img_key(this.head);
    this._mesh_head.set_info(pic).apply();

    const { gpl } = this;
    if (!gpl) return;
    this._mesh_head.visible = this.joined;
    if (gpl.state === GamePrepareState.PlayerCharacterSel) {
      this._mesh_hints.visible = !this.joined;
      this._mesh_cd.visible = false;
    } else if (gpl.state === GamePrepareState.CountingDown) {
      this._mesh_cd.visible = !this.joined;
      this._mesh_hints.visible = false;
    } else {
      this._mesh_cd.visible = false;
      this._mesh_hints.visible = false;
    }
  }

  on_render(dt: number): void {
    this._opacity.update(dt)
    if (this._mesh_hints) this._mesh_hints.opacity = this._opacity.value
  }
}