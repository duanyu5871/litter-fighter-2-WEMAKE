import * as THREE from 'three';
import { ILf2Callback } from '../../LF2/ILf2Callback';
import { LayoutComponent } from './LayoutComponent';
import { TextBuilder } from './TextBuilder';

export default class LoadingFileNameDisplayer extends LayoutComponent implements ILf2Callback {
  override on_mount(): void {
    super.on_mount();
    this.lf2.callbacks.add(this)
  }
  override on_unmount(): void {
    super.on_unmount();
    this.lf2.callbacks.del(this)
  }
  on_loading_content(content: string): void {
    this.update_sprite(content);
  }
  on_loading_end(): void {
    this.update_sprite('');
    this.lf2.set_layout('main_page')
  }
  protected _mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected async update_sprite(loading_content: string) {
    if (!loading_content) {
      this._mesh?.removeFromParent();
      delete this._mesh;
      return;
    }
    if (!this.layout.mesh) return;

    const text_builder = TextBuilder
      .get(this.lf2)
      .center(...this.layout.center)
      .text(loading_content)
      .style(this.layout.style)

    if (!this._mesh) {
      this._mesh = await text_builder.build_mesh()
      this.layout.mesh.add(this._mesh);
      this._mesh.name = LoadingFileNameDisplayer.name;
    } else {
      const [geo, tex] = await text_builder.build();
      if (!this.mounted) return;
      this._mesh.geometry = geo;
      this._mesh.material.map = tex;
      this._mesh.material.needsUpdate = true;
    }
  }
}
