import type { ILayoutData } from './ILayoutData';
import type LF2 from './LF2/LF2';
import type { Condition, ValGetter } from './LF2/loader/Condition';
import type { TImageInfo, image_pool } from './LF2/loader/loader';
import { LayoutItem } from './LayoutItem';
import { is_arr } from './is_arr';
import { is_bool } from './js_utils/is_bool';
import { is_num } from './js_utils/is_num';
import { is_str } from './js_utils/is_str';

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
}