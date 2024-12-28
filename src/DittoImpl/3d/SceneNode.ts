import * as THREE from "three";
import {
  IObjectNode,
  IOrthographicCameraNode,
  is_orthographic_camera_node,
  ISceneNode,
} from "../../LF2/3d";
import LF2 from "../../LF2/LF2";
import { __ObjectNode } from "./ObjectNode";

export class __SceneNode extends __ObjectNode implements ISceneNode {
  readonly is_scene_node = true;
  protected _cameras = new Set<IOrthographicCameraNode>();
  protected _renderer: THREE.WebGLRenderer;

  constructor(lf2: LF2, canvas: HTMLCanvasElement) {
    super(lf2, new THREE.Scene());
    this._renderer = new THREE.WebGLRenderer({ canvas });
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
    this._renderer.setSize(this.w, this.h, false);
    return this;
  }
  override dispose(): void {
    this._renderer.clear();
    this._renderer.dispose();
    super.dispose();
  }
  render(): void {
    const { inner } = this;
    for (const camera of this._cameras) {
      // FIXME: AVOID ANY
      this._renderer.render(inner, (camera as any).inner);
    }
  }
}
