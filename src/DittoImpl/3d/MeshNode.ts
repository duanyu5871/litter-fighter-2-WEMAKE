import { Material, Mesh } from "three";
import { BufferGeometry, IMeshInfo, IMeshNode } from "../../LF2/3d/IMeshNode";
import LF2 from "../../LF2/LF2";
import { __ObjectNode } from "./ObjectNode";
import { dispose_material } from "./disposer";

export class __MeshNode extends __ObjectNode implements IMeshNode {
  readonly is_mesh_node = true;
  private __info: IMeshInfo = {}
  constructor(lf2: LF2, info?: IMeshInfo) {
    super(lf2, new Mesh(
      info?.geometry,
      info?.material,
    ))
    if (info) this.__info = info
  }

  set geometry(v: BufferGeometry) { this.inner.geometry = v }
  get geometry(): BufferGeometry { return this.inner.geometry }
  get render_order(): number { return this.inner.renderOrder }
  set render_order(v: number) { this.inner.renderOrder = v }
  get inner() { return this._inner as Mesh }
  get material() { return this.inner.material };

  set_info(info: IMeshInfo): this {
    this.__info = info
    return this
  }
  get_info(): IMeshInfo { return this.__info }

  tran_materials_opacity(offset: number) {
    const m = this.material;
    if (!Array.isArray(m)) {
      m.opacity += offset
      return this;
    }
    for (const mm of m)
      mm.opacity += offset
    return this;
  }
  private traversal_material(fn: (m: Material) => void): this {
    const m = this.material;
    if (!Array.isArray(m))
      fn(m);
    else for (const mm of m)
      fn(mm);
    return this;
  }
  set_materials_opacity(opacity: number): this {
    return this.traversal_material((m) => {
      m.opacity = opacity
    })
  }
  update_all_material(): this {
    return this.traversal_material((m) => {
      m.needsUpdate = !null
    })
  }
  set_depth_test(v: boolean): this {
    return this.traversal_material(m => m.depthTest = v)
  }
  set_depth_write(v: boolean): this {
    return this.traversal_material(m => m.depthWrite = v)
  }
  dispose() {
    super.dispose();
    const { inner } = this
    inner.removeFromParent();
    this.traversal_material(dispose_material)
    inner.geometry.dispose();
  }
}