import { filter } from "../../utils/container_help";
import { TKeyName } from "../../controller/BaseController";
import Layout from "../Layout";
import { LayoutComponent } from "./LayoutComponent";

export class ReachableLayoutGroup extends LayoutComponent {
  protected get _name(): string { return this.args[0] || '' };
  protected get _direction(): string { return this.args[1] || '' };
  protected _set = new Set<ReachableLayout>();
  protected _arr: ReachableLayout[] = [];

  get name(): string { return this._name; }

  get binded_layout(): Layout {
    const lid = this.args[2];
    if (!lid) return this.layout;
    return this.layout.root.find_layout(lid) || this.layout
  }

  add(l: ReachableLayout): this {
    this._set.add(l);
    return this;
  }

  del(l: ReachableLayout): this {
    this._set.delete(l);
    return this;
  }

  on_player_key_down(_player_id: string, key: TKeyName): void {
    if (this._set.size < 0) return;
    if (this._direction !== 'lr' && this._direction !== 'ud') return;
    if (this._direction === 'lr' && key !== 'L' && key !== 'R') return;
    if (this._direction === 'ud' && key !== 'U' && key !== 'D') return;
    if (!this.binded_layout.visible) return;

    const items = filter(this._set, v => v.layout.global_visible && !v.layout.global_disabled).map(v => v.layout);
    const items_len = items.length
    if (!items_len) return;

    if (this._direction === 'lr')
      items.sort((a, b) => a.x_on_root - b.y_on_root);
    else if (this._direction === 'ud')
      items.sort((a, b) => a.y_on_root - b.y_on_root);

    if (key === 'L' || key === 'U') {
      const idx = items.findIndex(v => v === this.layout.root.focused_item);
      this.layout.root.focused_item = items[(Math.max(idx, 0) + items_len - 1) % items_len];
    } else if (key === 'R' || key === 'D') {
      const idx = items.findIndex(v => v === this.layout.root.focused_item);
      this.layout.root.focused_item = items[(idx + 1) % items_len];
    }
  }
}

export class ReachableLayout extends LayoutComponent {
  get group(): ReachableLayoutGroup | undefined {
    return this.layout.root.find_component(ReachableLayoutGroup, v => v.name === this.group_name)
  }
  get group_name(): string { return this.args[0]; }

  override on_mount(): void {
    super.on_mount();
    this.group?.add(this);
  }
  override on_unmount(): void {
    super.on_unmount();
    this.group?.del(this);
  }
}

class Lazy<T> {
  static make<T>(init: () => T): Lazy<T> {
    return new Lazy(init)
  }
  private readonly _init: () => T;
  private _inited: boolean = false;
  private _value?: T;
  constructor(init: () => T) {
    this._init = init;
  }
  get(): T {
    if (!this._inited) {
      this._inited = true;
      this._value = this._init();
    };
    return this._value!;
  }
  reset(): void {
    this._inited = false
  }
}
