import * as THREE from 'three';
import { IPlayerInfoCallback } from '../../LF2/PlayerInfo';
import { TKeyName } from '../../LF2/controller/BaseController';
import { LayoutComponent } from './LayoutComponent';
import { TextBuilder } from './TextBuilder';

export class PlayerKeyEditor extends LayoutComponent implements IPlayerInfoCallback {
  protected _which?: string;
  protected _key_name?: string;
  protected _sprite?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;

  override init(...args: string[]): this {
    const [which = '', key_name = ''] = args;
    this._which = which;
    this._key_name = key_name;
    return this;
  }

  override on_click() {
    window.addEventListener('pointerdown', this._on_cancel, { once: true });
    window.addEventListener('keydown', this._on_keydown, { once: true });
    if (this._sprite?.material) this._sprite.material.color = new THREE.Color(16 / 255, 32 / 255, 108 / 255)
    return true;
  }

  override on_mount() {
    this.update_sprite();
    this.lf2.player_infos.get(this._which!)?.add_callback(this);
  }

  override on_unmount(): void {
    this._on_cancel();
    this._sprite?.removeFromParent();
    this.lf2.player_infos.get(this._which!)?.del_callback(this);
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
    if (this._sprite?.material) this._sprite.material.color = new THREE.Color('white')
  }

  async update_sprite() {
    this._sprite?.removeFromParent();
    this._sprite = void 0;
    if (this._which === void 0) return;
    if (this._key_name === void 0) return;
    if (!this.layout.sprite) return;
    const player_info = this.lf2.player_infos.get(this._which);
    if (player_info) {
      const keycode = player_info.keys[this._key_name as TKeyName];
      const sprite = this._sprite = await TextBuilder.get(this.lf2)
        .text(keycode ?? '')
        .style({ font: '16px Arial' })
        .build_mesh()
      this.layout.sprite.add(sprite);
      sprite.position.x = this.layout.size[0] / 2
      sprite.position.y = -this.layout.size[1] / 2
    }
  }
}

