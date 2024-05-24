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

  override on_resume(): void {
    super.on_resume();

    this.layout.sprite.add(this._mesh);
    this._unmount_jobs.add(
      this.lf2.callbacks.add({
        on_difficulty_changed: () => this.handle_changed()
      }),
      () => this._mesh.del_self(),
    )
    this.handle_changed();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  protected handle_changed() {
    this._mesh.set_text(this.text).apply()
  }

}