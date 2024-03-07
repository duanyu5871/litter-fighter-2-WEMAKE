import * as THREE from 'three';
import { Box3Helper } from 'three';
import { Entity } from './Entity';
export const EMPTY_ARR = [] as const;
export const INDICATORS_MATERIAL_COLOR = {
  bdy: 0x00ff00,
  itr: 0xff0000
}
export const INDICATORS_MATERIAL = {
  bdy: new THREE.SpriteMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5, depthTest: false, depthWrite: false }),
  itr: new THREE.SpriteMaterial({ color: 0xff0000, transparent: true, opacity: 0.5, depthTest: false, depthWrite: false })
}
export class EntityIndicators {
  protected _entity: Entity;
  protected _show = false;
  protected _indicators = {
    bdy: new Array<THREE.Box3Helper>(),
    itr: new Array<THREE.Box3Helper>(),
  };
  protected get sprite() { return this._entity.sprite; };
  protected get scene() { return this._entity.world.scene; };
  private _box?: THREE.Object3D;
  protected get box() {
    if (this._box) return this._box;
    const edges = new THREE.EdgesGeometry(this._entity.sprite.geometry);
    const box = this._box = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 'yellow' }));
    const { x: cx, y: cy } = this.sprite.center;
    this._box.position.set(0.5 - cx, 0.5 - cy, 0)
    this.sprite.add(box);
    return this._entity.sprite;
  }
  protected get frame() { return this._entity.get_frame(); }
  protected get face() { return this._entity.face; }
  get show() { return this._show; }
  set show(v: boolean) {
    if (this._show === v) return;
    if (v || this._box) this.box.visible = v;

    this._show = v;
    if (v) this.update();
    else this._hide_all();
  }
  constructor(e: Entity) {
    this._entity = e;
  }
  protected _get_indicator(k: keyof typeof this._indicators, idx: number): Box3Helper {
    if (this._indicators[k][idx]) return this._indicators[k][idx];
    const ret = this._indicators[k][idx] = new Box3Helper(new THREE.Box3(), INDICATORS_MATERIAL_COLOR[k]);
    this.sprite.add(ret);
    return ret;
  }
  protected _hide_indicator(k: keyof typeof this._indicators, idx: number) {
    const s = this._indicators[k][idx];
    if (s) s.visible = false;
  }
  protected _hide_all() {
    this._indicators.bdy.forEach(i => i.visible = false);
    this._indicators.itr.forEach(i => i.visible = false);
  }
  update(name?: keyof typeof this._indicators) {
    if (this._box) {
      const { x: cx, y: cy } = this.sprite.center;
      this._box.position.set(0.5 - cx, 0.5 - cy, 0)
    }
    if (1) return
    if (!name) {
      this.update('bdy');
      this.update('itr');
      return;
    }
    const data = this.frame[name] || EMPTY_ARR;
    const l1 = data.length;
    const l2 = Math.max(this._indicators[name].length, l1);
    for (let i = 0; i < l2; ++i) {
      if (i >= l1) {
        this._hide_indicator(name, i);
        continue;
      }
      const info = data[i].indicator_info?.[this.face];
      if (!info) {
        this._hide_indicator(name, i);
        continue;
      }
      const { x, y, w, h, cx, cy } = info;
      const sp = this._get_indicator(name, i);
      sp.box.min.set(x, y, 2);
      sp.box.max.set(x + w, x + h, 1);
      sp.visible = true;
    }
  }
}
