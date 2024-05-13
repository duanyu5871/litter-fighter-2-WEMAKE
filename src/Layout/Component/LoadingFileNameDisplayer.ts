import * as THREE from 'three';
import { ILf2Callback } from '../../LF2/ILf2Callback';
import { LayoutComponent } from './LayoutComponent';
import { TextBuilder } from './TextBuilder';
import { dispose_mesh } from '../utils/release_mesh';

export default class LoadingFileNameDisplayer extends LayoutComponent {
  protected _mesh?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

  protected _lf2_listener: ILf2Callback = {
    on_loading_content: (content: string): void => {
      this.update_sprite(content);
    },
    on_loading_end: (): void => {
      this.update_sprite('');
      this.lf2.set_layout('main_page')
    }
  }

  override on_mount(): void {
    super.on_mount();
    this.lf2.callbacks.add(this._lf2_listener)
  }

  override on_unmount(): void {
    super.on_unmount();
    this.lf2.callbacks.del(this._lf2_listener)
    if (this._mesh) {
      dispose_mesh(this._mesh);
      delete this._mesh;
    }
  }

  protected async update_sprite(loading_content: string) {
    if (!this.mounted) return;

    if (!loading_content) {
      if (this._mesh) {
        dispose_mesh(this._mesh);
        delete this._mesh;
      }
      return;
    }
    if (!this.layout.mesh) return;

    const text_builder = TextBuilder
      .get(this.lf2)
      .center(...this.layout.center)
      .text(loading_content)
      .style(this.layout.style)

    if (!this._mesh) {
      const mesh = await text_builder.build_mesh();
      if (!this.mounted || this._mesh) {
        mesh.geometry.dispose();
        mesh.material.map?.dispose();
        return;
      }
      this.layout.mesh.add(this._mesh = mesh);
      this._mesh.name = LoadingFileNameDisplayer.name;
    } else {
      const [geo, tex] = await text_builder.build();
      if (!this.mounted || !this._mesh) {
        geo.dispose();
        tex.dispose();
        return;
      }
      this._mesh.geometry = geo;
      this._mesh.material.map = tex;
      this._mesh.material.needsUpdate = true;
    }
  }
}
