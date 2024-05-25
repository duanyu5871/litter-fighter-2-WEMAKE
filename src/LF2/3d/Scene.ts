import * as THREE from "three";
import Camera_O from "./Camera_O";
import INode from "./INode";
import Node from "./Node";

export default class Scene extends Node {
  protected _cameras = new Set<Camera_O>();
  protected _renderer: THREE.WebGLRenderer;
  override get inner(): THREE.Scene { return this._inner as THREE.Scene }

  constructor(canvas: HTMLCanvasElement) {
    super();
    this._inner = new THREE.Scene();
    this._renderer = new THREE.WebGLRenderer({ canvas })
  }
  override add(...nodes: INode[]): this {
    super.add(...nodes);
    for (const n of nodes)
      if (n instanceof Camera_O)
        this._cameras.add(n)

    return this;
  }
  override del(...nodes: INode[]): this {
    super.del(...nodes);
    for (const n of nodes)
      if (n instanceof Camera_O)
        this._cameras.delete(n)
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
      this._renderer.render(inner, camera.inner);
    }
  }
}

