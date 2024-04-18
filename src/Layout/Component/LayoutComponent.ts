import Layout from '../Layout';

export class LayoutComponent {
  readonly layout: Layout;
  private _mounted: boolean = false;
  get mounted() { return this._mounted }
  get lf2() { return this.layout.lf2 }
  get world() { return this.layout.lf2.world }
  constructor(layout: Layout) {
    this.layout = layout;
  }
  init(...args: string[]): this { return this; }
  on_click?(): boolean | void;

  on_mount(): void { this._mounted = true }
  on_unmount(): void { this._mounted = false }

  on_show?(): void;
  on_hide?(): void;
}