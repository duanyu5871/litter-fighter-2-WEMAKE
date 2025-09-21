import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import {
  IObjectNode,
  IOrthographicCameraNode,
  is_orthographic_camera_node,
} from "../../LF2/3d";
import { LF2 } from "../../LF2/LF2";
import { floor } from "../../LF2/utils";
import * as THREE from "../3d/_t";
import { __Object } from "./__Object";
import styles from "./styles.module.scss";

export class __Scene extends __Object {
  readonly is_scene_node = true;
  protected _cameras = new Set<IOrthographicCameraNode>();
  protected _renderer?: THREE.WebGLRenderer;
  protected _css_renderer?: CSS2DRenderer;
  protected _canvas_ob = new MutationObserver(() => this.on_win_resize());
  override get inner(): THREE.Scene { return this._inner as THREE.Scene }
  constructor(lf2: LF2) {
    super(lf2, new THREE.Scene());
    window.addEventListener('resize', this.on_win_resize)
  }
  on_win_resize = () => {
    if (!this._css_renderer || !this._renderer) return;
    const styles = window.getComputedStyle(this._renderer.domElement)

    let w = parseInt(styles.width)
    let h = parseInt(styles.height)
    const scale = w / this.lf2.world.width
    w = floor(w / scale)
    h = floor(h / scale)

    this._css_renderer.setSize(w, h)
    this._css_renderer.domElement.style.top = styles.top;
    this._css_renderer.domElement.style.left = styles.left;
    this._css_renderer.domElement.style.width = `${w}px`;
    this._css_renderer.domElement.style.height = `${h}px`;
    this._css_renderer.domElement.style.zIndex = '1';
    this._css_renderer.domElement.style.transform = `scale(${scale})`
    this._css_renderer.domElement.style.transformOrigin = `0px 0px`
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
      this._canvas_ob.observe(canvas, { attributes: true, attributeFilter: ['style'] })
      this._renderer = new THREE.WebGLRenderer({ canvas, premultipliedAlpha: false });
      this._renderer.setSize(this.w, this.h, false);
      this._css_renderer = new CSS2DRenderer();
      this._css_renderer.domElement.className = styles.css_2d_renderer
      this.on_win_resize()
      document.body.appendChild(this._css_renderer.domElement);
    } else {
      this._canvas_ob.disconnect()
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

    window.removeEventListener('resize', this.on_win_resize)
    if (this._css_renderer)
      document.body.removeChild(this._css_renderer?.domElement);
    this._canvas_ob.disconnect()
    this._renderer?.clear();
    this._renderer?.dispose();
    this._renderer = void 0;
    super.dispose();
  }
  render(): void {
    const { inner } = this;
    if (!this._renderer || !inner) return;
    for (const camera of this._cameras) {
      this._renderer.render(inner, (camera as any).inner);
      this._css_renderer?.render(inner, (camera as any).inner)
    }
  }
}
