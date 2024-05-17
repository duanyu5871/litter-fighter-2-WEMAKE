import NumberAnimation from "../../animation/NumberAnimation";
import SequenceAnimation from "../../animation/SequenceAnimation";
import Invoker from "../../base/Invoker";
import { LayoutComponent } from "./LayoutComponent";

export default class LaunchPageLogic extends LayoutComponent {
  get entry_name(): string { return this.args[0] || '' }
  protected _layouts_loaded: boolean = false;
  protected _dispose_jobs = new Invoker();
  protected _opacity = new SequenceAnimation(1000, new NumberAnimation(0, 1, 500), 1000);
  get bearface() { return this.layout.find_layout('bearface') }
  get yeonface() { return this.layout.find_layout('yeonface') }

  protected on_layouts_loaded() {
    this._layouts_loaded = true;
  }
  override init(...args: string[]): this {
    super.init(...args);
    this._dispose_jobs.add(
      this.lf2.callbacks.add({
        on_layouts_loaded: () => this.on_layouts_loaded(),
      })
    )
    return this;
  }
  override dispose(): void {
    this._dispose_jobs.invoke();
    this._dispose_jobs.clear();
  }
  override on_mount(): void {
    super.on_mount();
    const { bearface, yeonface } = this;
    if (bearface) bearface.opacity = 0;
    if (yeonface) yeonface.opacity = 0;
  }

  on_render(dt: number): void {
    const { bearface, yeonface } = this;
    if (
      bearface?.sprite.mesh.material.map?.image &&
      yeonface?.sprite.mesh.material.map?.image
    ) {
      bearface.opacity = yeonface.opacity = this._opacity.update(dt)
      if (this._opacity.is_finish) {
        if (this._opacity.reverse) {
          this.lf2.set_layout('entry')
        } else {
          this._opacity.play(true)
        }
      }
    }
  }
}
