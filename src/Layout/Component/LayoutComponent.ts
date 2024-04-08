import Layout from '../Layout';


export class LayoutComponent {
  protected _layout: Layout;
  constructor(layout: Layout) {
    this._layout = layout;
  }
  on_click?(): boolean | void;
  on_mount?(): void;
  on_unmount?(): void;
}
