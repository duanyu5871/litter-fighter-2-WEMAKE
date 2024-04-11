import * as THREE from 'three';
import { ILf2Callback } from '../../LF2/LF2';
import { create_picture, image_pool } from '../../LF2/loader/loader';
import { LayoutComponent } from './LayoutComponent';

export class LoadingFileNameDisplayer extends LayoutComponent implements ILf2Callback {
  override on_mount(): void {
    this._layout.lf2.add_callbacks(this)
  }
  override on_unmount(): void {
    this._layout.lf2.del_callbacks(this)
  }
  on_loading_content(content: string): void {
    this.update_sprite(content);
  }
  on_loading_end(): void {
    this.update_sprite('');
    this._layout.lf2.set_layout('main_page')
  }
  protected _sprite: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected async update_sprite(loading_content: string) {
    if (!loading_content) {
      this._sprite?.removeFromParent();
      delete this._sprite;
      return;
    }
    if (!this._layout.sprite) return;

    const { data } = this._layout;
    const font = data.font?.join(' ');
    const fillStyle = data.txt_fill;
    const strokeStyle = data.txt_stroke;
    const [cx, cy] = this._layout.center
    const img = await image_pool.load_text(loading_content, { font, fillStyle, strokeStyle });
    const texture = create_picture(img.key, img).data.texture
    const geo = new THREE.PlaneGeometry(img.w, img.h).translate(img.w * (0.5 - cx), img.h * (cy - 0.5), 0);
    if (!this._sprite) {
      this._sprite = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, map: texture }))
      this._layout.sprite.add(this._sprite);
    } else {
      this._sprite.geometry = geo;
      this._sprite.material.map = texture;
      this._sprite.material.needsUpdate = true;
    }
  }

}
