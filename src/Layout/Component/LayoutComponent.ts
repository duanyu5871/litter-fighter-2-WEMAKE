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
  get mounted() { return this._mounted }
  get lf2() { return this.layout.lf2 }
  get world() { return this.layout.lf2.world }

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

  init(...args: string[]): this { return this; }
  on_click?(): boolean | void;

  on_mount(): void { this._mounted = true }
  on_unmount(): void { this._mounted = false }

  on_show?(): void;
  on_hide?(): void;
}