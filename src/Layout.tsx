import * as THREE from 'three';
import type { ILayoutData } from './ILayoutData';
import type LF2 from './LF2/LF2';
import type { ValGetter } from './LF2/loader/Condition';
import { LayoutItem } from './LayoutItem';

export class Layout {
  private _state: any = {};
  readonly data: ILayoutData;
  readonly items: LayoutItem[];
  get state() { return this._state }

  constructor(data: ILayoutData, items: LayoutItem[]) {
    this.data = data;
    this.items = items;
  }

  mount() {
    this._state = {};
    for (const item of this.items)
      item.mount()
  }
  unmount() { }

  static async cook(lf2: LF2, data: ILayoutData, get_val: ValGetter<LayoutItem>) {
    const cooked_layout = new Layout(data, [])
    for (const raw_item of data.items) {
      const cooked_item = await LayoutItem.cook(lf2, cooked_layout, raw_item, get_val);
      cooked_layout.items.push(cooked_item);
    }
    return cooked_layout;
  }

  private _object_3d?: THREE.Object3D;
  get object_3d() { return this._object_3d }
  init_3d() {
    this._object_3d = new THREE.Object3D();
    for (const item of this.items)
      item.init_3d();
  }
}