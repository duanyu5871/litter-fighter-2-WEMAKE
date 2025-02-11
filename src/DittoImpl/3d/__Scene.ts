import * as THREE from "./_t";
import {
  IObjectNode,
  IOrthographicCameraNode,
  is_orthographic_camera_node,
  IScene,
} from "../../LF2/3d";
import LF2 from "../../LF2/LF2";
import { __Object } from "./__Object";

export class __Scene extends __Object implements IScene {
  readonly is_scene_node = true;
  protected _cameras = new Set<IOrthographicCameraNode>();
  protected _renderer?: THREE.WebGLRenderer;
  constructor(lf2: LF2) {
    super(lf2, new THREE.Scene());
  }
  set_canvas(canvas: HTMLCanvasElement | null | undefined) {
    if (this._renderer) {
      if (canvas === this._renderer.domElement)
        return;
      this._renderer.clear();
      this._renderer.dispose();
    }
    this._renderer = void 0;
    if (canvas) {
      this._renderer = new THREE.WebGLRenderer({ canvas });
      this._renderer.setSize(this.w, this.h, false);
    }
  }
  override add(...nodes: IObjectNode[]): this {
    super.add(...nodes);
    for (const n of nodes)
      if (is_orthographic_camera_node(n)) this._cameras.add(n);
    return this;
  }
  override del(...nodes: IObjectNode[]): this {
    super.del(...nodes);
    for (const n of nodes)
      if (is_orthographic_camera_node(n)) this._cameras.delete(n);
    return this;
  }
  override set_size(w?: number | undefined, h?: number | undefined): this {
    super.set_size(w, h);
    this._renderer?.setSize(this.w, this.h, false);
    return this;
  }
  override dispose(): void {
    this._renderer?.clear();
    this._renderer?.dispose();
    this._renderer = void 0;
    super.dispose();
  }
  render(): void {
    const { inner } = this;
    if (!this._renderer) return;
    for (const camera of this._cameras) {
      this._renderer.render(inner, (camera as any).inner);
    }
  }
}
