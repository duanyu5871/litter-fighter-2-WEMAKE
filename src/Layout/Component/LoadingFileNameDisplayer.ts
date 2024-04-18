import * as THREE from 'three';
import { ILf2Callback } from '../../LF2/LF2';
import { LayoutComponent } from './LayoutComponent';
import { TextBuilder } from './TextBuilder';

export class LoadingFileNameDisplayer extends LayoutComponent implements ILf2Callback {
  override on_mount(): void {
    super.on_mount();
    this.layout.lf2.add_callbacks(this)
  }
  override on_unmount(): void {
    super.on_unmount();
    this.layout.lf2.del_callbacks(this)
  }
  on_loading_content(content: string): void {
    this.update_sprite(content);
  }
  on_loading_end(): void {
    this.update_sprite('');
    this.layout.lf2.set_layout('main_page')
  }
  protected _sprite: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected async update_sprite(loading_content: string) {
    if (!loading_content) {
      this._sprite?.removeFromParent();
      delete this._sprite;
      return;
    }
    if (!this.layout.sprite) return;

    const { data } = this.layout;
    const text_builder = TextBuilder
      .get(this.lf2)
      .center(...this.layout.center)
      .text(loading_content)
      .style({
        font: data.font?.join(' '),
        fillStyle: data.txt_fill,
        shadowColor: data.txt_stroke
      })

    if (!this._sprite) {
      this.layout.sprite.add(
        this._sprite = await text_builder.build_mesh()
      );
    } else {
      const [geo, tex] = await text_builder.build();
      if (!this.mounted) return;
      this._sprite.geometry = geo;
      this._sprite.material.map = tex;
      this._sprite.material.needsUpdate = true;
    }
  }
}
