import { IPlayerInfoCallback } from '../../LF2/PlayerInfo';
import { TKeyName } from '../../LF2/controller/BaseController';
import { LayoutComponent } from './LayoutComponent';
import Sprite from './Sprite';
import { TextBuilder } from './TextBuilder';

export default class PlayerKeyEditor extends LayoutComponent implements IPlayerInfoCallback {
  protected get _which() { return this.args[0] || '' };
  protected get _key_name() { return this.args[1] || '' };
  protected _sprite?: Sprite;

  override on_click() {
    window.addEventListener('pointerdown', this._on_cancel, { once: true });
    window.addEventListener('keydown', this._on_keydown, { once: true });
    this._sprite?.set_rgb(16 / 255, 32 / 255, 108 / 255)
    return true;
  }

  override on_mount() {
    super.on_mount();
    this.update_sprite();
    this.lf2.player_infos.get(this._which!)?.callbacks.add(this);
  }

  override on_unmount(): void {
    super.on_unmount();
    this._on_cancel();
    this._sprite?.dispose();
    this.lf2.player_infos.get(this._which!)?.callbacks.del(this);
  }

  on_key_changed(name: TKeyName, value: string) {
    this.update_sprite();
  }

  private _on_keydown = (e: KeyboardEvent) => {
    if ('escape' === e.key.toLowerCase())
      return this._on_cancel();
    if (this._which === void 0) return;
    if (this._key_name === void 0) return;
    this.lf2.player_infos.get(this._which)?.set_key(this._key_name, e.key).save();
    this._on_cancel();
  }

  private _on_cancel = () => {
    window.removeEventListener('keydown', this._on_keydown);
    window.removeEventListener('pointerdown', this._on_cancel);
    this._sprite?.set_rgb(1, 1, 1)
  }

  async update_sprite() {
    this._sprite?.removeFromParent();
    this._sprite = void 0;
    if (this._which === void 0) return;
    if (this._key_name === void 0) return;
    if (!this.layout.mesh) return;
    const player_info = this.lf2.player_infos.get(this._which);
    if (player_info) {
      const keycode = player_info.keys[this._key_name as TKeyName];
      const sprite = this._sprite = new Sprite(
        await TextBuilder.get(this.lf2)
          .text(keycode ?? '')
          .style({ font: '16px Arial' })
          .build_pic()
      )
        .set_pos(this.layout.size[0] / 2, -this.layout.size[1] / 2)
        .set_name(PlayerKeyEditor.name);
      this.layout.mesh.add(sprite.mesh);

    }
  }
}

