import Layout from '../Layout';

export class LayoutComponent {
  readonly layout: Layout;
  get lf2() { return this.layout.lf2 }
  get world() { return this.layout.lf2.world }
  constructor(layout: Layout) {
    this.layout = layout;
  }
  init(...args: string[]): this { return this; }
  on_click?(): boolean | void;
  on_mount?(): void;
  on_unmount?(): void;
  on_show?(): void;
  on_hide?(): void;
}