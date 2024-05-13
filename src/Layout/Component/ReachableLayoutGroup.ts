import { TKeyName } from "../../LF2/controller/BaseController";
import { Log } from "../../Log";
import Layout from "../Layout";
import { LayoutComponent } from "./LayoutComponent";

export class ReachableLayoutGroup extends LayoutComponent {
  protected _direction: string = '';
  protected _name: string = '';
  protected _set = new Set<ReachableLayout>();
  protected _arr: ReachableLayout[] = [];
  protected _binded_layout_id?: string;

  get name(): string { return this._name; }

  get binded_layout(): Layout {
    if (!this._binded_layout_id) return this.layout;
    return this.layout.root.find_layout(this._binded_layout_id) || this.layout
  }

  /**
   * @inheritdoc
   *
   * @param {string} [name='']
   * @param {string} [direction='']
   * @param {(string | undefined)} [binded_layout_id=void 0] 绑定的布局
   * @returns {this}
   */
  @Log
  override init(name: string = '', direction: string = '', binded_layout_id: string | undefined = void 0): this {
    super.init(name, direction);
    this._direction = direction;
    this._name = name;
    this._binded_layout_id = binded_layout_id;
    return this;
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

    const items = Array.from(this._set).filter(v => v.layout.mesh?.visible).map(v => v.layout);
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
  protected _group?: ReachableLayoutGroup;
  protected _group_name: string = '';
  get group_name(): string { return this._group_name; }

  @Log
  init(...args: string[]): this {
    super.init(...args);
    const [group_name = ''] = args;
    this._group_name = group_name;
    return this;
  }
  on_mount(): void {
    this._group = this.layout.root.find_component(ReachableLayoutGroup, v => v.name === this._group_name)
    this._group?.add(this);
    if (!this._group) debugger;
  }
  on_unmount(): void {
    this._group?.del(this);
  }
}