import Invoker from '../../base/Invoker';
import { Defines } from '../../defines/defines';
import Layout from '../Layout';
import { LayoutComponent } from "./LayoutComponent";
import Text from '../../3d/Text';

export default class DifficultyText extends LayoutComponent {
  protected get text(): string {
    return Defines.DifficultyLabels[this.lf2.difficulty]
  }
  protected _mesh: Text;
  protected _unmount_jobs = new Invoker();

  constructor(layout: Layout, f_name: string) {
    super(layout, f_name)
    this._mesh = new Text(this.lf2)
      .set_center(0, 0.5)
      .set_name(DifficultyText.name)
      .set_style({
        fill_style: '#9b9bff',
        font: '14px Arial',
      })
  }

  override on_mount(): void {
    super.on_mount();

    this.layout.sprite.add(this._mesh);
    this._unmount_jobs.add(
      this.lf2.callbacks.add({
        on_difficulty_changed: () => this.handle_changed()
      }),
      () => this._mesh.removeFromParent(),
    )
    this.handle_changed();
  }

  override on_unmount(): void {
    super.on_unmount();
    this._unmount_jobs.invoke();
    this._unmount_jobs.clear();
  }

  protected handle_changed() {
    this._mesh.set_text(this.text).apply()
  }

}