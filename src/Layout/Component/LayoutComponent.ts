import type { TKeyName } from '../../LF2/controller/BaseController';
import Layout from '../Layout';


/**
 * 布局组件基类
 *
 * @export
 * @class LayoutComponent
 */
export class LayoutComponent {

  readonly layout: Layout;
  readonly f_name: string;
  private _mounted: boolean = false;
  private _args: readonly string[] = [];
  get mounted() { return this._mounted }
  get lf2() { return this.layout.lf2 }
  get world() { return this.layout.lf2.world }
  get args(): readonly string[] { return this._args }
  /**
   * 布局组件基类构造函数
   *
   * @constructor
   * @protected
   * @param {Layout} layout 布局对象
   * @param {string} f_name 组件在工厂中的名字
   */
  constructor(layout: Layout, f_name: string) {
    this.layout = layout;
    this.f_name = f_name;
  }

  init(...args: string[]): this {
    this._args = args;
    return this;
  }
  on_click?(): boolean | void;

  on_mount(): void { this._mounted = true }
  on_mounted(): void { }
  on_unmount(): void { this._mounted = false }

  on_show?(): void;
  on_hide?(): void;
  on_blur(): void {}
  on_foucs(): void {}
  on_render?(dt: number): void;
  on_player_key_down?(player_id: string, key: TKeyName): void;
  dispose?(): void;
}