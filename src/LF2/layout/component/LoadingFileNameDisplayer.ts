import Text from '../../3d/Text';
import Invoker from '../../base/Invoker';
import Layout from '../Layout';
import { LayoutComponent } from './LayoutComponent';

export default class LoadingFileNameDisplayer extends LayoutComponent {
  protected _unmount_job = new Invoker();
  protected _mesh: Text;

  constructor(layout: Layout, f_name: string) {
    super(layout, f_name);
    this._mesh = new Text(this.lf2)
      .set_pos(0, 0, 1)
      .set_center(...this.layout.center)
      .set_style(this.layout.style)
      .set_name(LoadingFileNameDisplayer.name)
      .apply()
  }

  override on_mount(): void {
    super.on_mount();
    this.layout.sprite.add(this._mesh)
    this._unmount_job.add(
      () => this._mesh?.removeFromParent(),
      this.lf2.callbacks.add({
        on_loading_content: content => this.update_sprite(content),
        on_loading_end: (): void => this.lf2.set_layout('main_page')
      })
    )
  }
  
  override on_unmount(): void {
    super.on_unmount();
    this._unmount_job.invoke();
    this._unmount_job.clear();
  }

  protected async update_sprite(text: string) {
    this._mesh.set_text(text).apply();
  }
}
