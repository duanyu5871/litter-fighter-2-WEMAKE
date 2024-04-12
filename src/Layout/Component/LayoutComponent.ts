import Layout from '../Layout';

export class LayoutComponent {
  readonly layout: Layout;
  constructor(layout: Layout) {
    this.layout = layout;
  }
  init(...args: string[]): this { return this; }
  on_click?(): boolean | void;
  on_mount?(): void;
  on_unmount?(): void;
}