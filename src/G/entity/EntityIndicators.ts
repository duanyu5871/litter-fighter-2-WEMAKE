import * as THREE from 'three';
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
    bdy: new Array<THREE.Sprite>(),
    itr: new Array<THREE.Sprite>()
  };

  protected get sprite() { return this._entity.sprite; };
  protected get frame() { return this._entity.get_frame(); }
  protected get face() { return this._entity.face; }
  get show() { return this._show; }
  set show(v: boolean) {
    if (this._show === v) return;
    this._show = v;
    if (v) this.update();
    else this._hide_all();
  }
  constructor(e: Entity) {
    this._entity = e;
  }
  protected _get_indicator(k: keyof typeof this._indicators, idx: number) {
    if (this._indicators[k][idx]) return this._indicators[k][idx];
    const sp = this._indicators[k][idx] = new THREE.Sprite(INDICATORS_MATERIAL[k]);
    sp.renderOrder = 3
    this.sprite.add(sp);
    return sp;
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
        this._hide_indicator(name, l1);
        continue;
      }
      const info = data[i].indicator_info?.[this.face];
      if (!info) {
        this._hide_indicator(name, l1);
        continue;
      }
      const { x, y, w, h, cx, cy } = info;
      const sp = this._get_indicator(name, i);
      sp.material.color.set(INDICATORS_MATERIAL_COLOR[name])
      sp.center.set(cx, cy);
      sp.position.set(x, y, 2);
      sp.scale.set(w, h, 1);
      sp.visible = true;
    }
  }
}
