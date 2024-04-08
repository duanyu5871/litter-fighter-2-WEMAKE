import { Err } from '@fimagine/logger';
import { LayoutComponent } from './LayoutComponent';
import { TKeyName } from '../../LF2/controller/BaseController';
import { create_picture, image_pool } from '../../LF2/loader/loader';
import * as THREE from 'three';


export class PlayerKeyEditor extends LayoutComponent {
  protected _which?: string;
  protected _key_name?: string;
  protected _sprite?: THREE.Mesh;
  protected _material?: THREE.MeshBasicMaterial;
  init(which: string, key_name: string): this {
    this._which = which;
    this._key_name = key_name;
    return this;
  }
  private _on_keydown = (e: KeyboardEvent) => {
    if ('escape' === e.key.toLowerCase()) return this._on_cancel();
    if (this._which === void 0) return;
    if (this._key_name === void 0) return;
    const player_info = this._layout.lf2.player_infos.get(this._which);
    if (player_info) {
      player_info.keys[this._key_name as TKeyName] = e.key.toLowerCase();
      player_info.save();
    } else {
      Err.print(PlayerKeyEditor.name, 'player_info not found, which:', this._which);
    }
    this.update_sprite();
  };
  private _on_cancel = () => {
    window.removeEventListener('keydown', this._on_keydown);
    window.removeEventListener('pointerdown', this._on_cancel);
    if (this._material) this._material.color = new THREE.Color('white')
  }
  on_click() {
    window.addEventListener('pointerdown', this._on_cancel, { once: true });
    window.addEventListener('keydown', this._on_keydown);
    if (this._material) this._material.color = new THREE.Color(16 / 255, 32 / 255, 108 / 255)
    return true;
  }
  on_mount() {
    this.update_sprite();
  }
  async update_sprite() {
    this._sprite?.removeFromParent();
    this._sprite = void 0;
    this._material = void 0;
    if (this._which === void 0) return;
    if (this._key_name === void 0) return;
    if (!this._layout.sprite) return;
    const player_info = this._layout.lf2.player_infos.get(this._which);
    if (player_info) {
      const keycode = player_info.keys[this._key_name as TKeyName];
      const img = await image_pool.load_text(keycode ?? '', { font: '16px Arial' });
      const geo = new THREE.PlaneGeometry(img.w, img.h);
      const params: THREE.MeshBasicMaterialParameters = {
        transparent: true,
        map: create_picture(img.key, img).data.texture
      };
      const material = this._material = new THREE.MeshBasicMaterial(params);
      const sprite = this._sprite = new THREE.Mesh(geo, material);

      this._layout.sprite.add(sprite);
      sprite.position.x = this._layout.size[0] / 2
      sprite.position.y = -this._layout.size[1] / 2
    }
  }
  on_unmount(): void {
    this._on_cancel();
    this._sprite?.removeFromParent();
  }
}
