import NumberAnimation from "../../animation/NumberAnimation";
import SequenceAnimation from "../../animation/SequenceAnimation";
import Invoker from "../../base/Invoker";
import Timeout from "../../dom/Timeout";
import { LayoutComponent } from "./LayoutComponent";

export default class LaunchPageLogic extends LayoutComponent {
  get entry_name(): string { return this.args[0] || '' }
  protected _layouts_loaded: boolean = false;
  protected _dispose_jobs = new Invoker();
  protected _offset_x = new SequenceAnimation(1000, new NumberAnimation(0, 40, 500));
  protected _scale = new SequenceAnimation(1000, new NumberAnimation(0, 2, 250), new NumberAnimation(2, 1, 250));
  protected _opacity = new SequenceAnimation(1000, new NumberAnimation(0, 1, 500), 1000);
  get bearface() { return this.layout.find_layout('bearface')! }
  get yeonface() { return this.layout.find_layout('yeonface')! }

  protected on_layouts_loaded() {
    this._layouts_loaded = true;
  }

  // Show text:
  // The gameplay, art, and sound are all from "Litter Fighter 2".
  //       created by Marti Wong and Starsky Wong in 1992.
  // 
  //              "LF2:Remake" created by Gim.

  override init(...args: string[]): this {
    super.init(...args);
    this.lf2.sounds.load('data/093.wav.ogg', 'data/093.wav.ogg')
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
    this.bearface.opacity = this.yeonface.opacity = 0;

    Timeout.set(() => this.lf2.sounds.play('data/093.wav.ogg'), 1000)
    this._scale.play(false)
    this._opacity.play(false)
    this._offset_x.play(false)
  }

  override on_unmount(): void {
    super.on_unmount();
  }

  override on_render(dt: number): void {
    const { bearface, yeonface } = this;
    const scale = this._scale.update(dt);
    const offset_x = this._offset_x.update(dt)
    const opacity = this._opacity.update(dt)
    bearface.sprite.x = 397 - offset_x;
    yeonface.sprite.x = 397 + offset_x;
    bearface.sprite.mesh.scale.set(scale, scale, 1);
    yeonface.sprite.mesh.scale.set(scale, scale, 1);
    bearface.opacity = yeonface.opacity = opacity
    if (this._opacity.is_finish && this._layouts_loaded) {
      if (this._opacity.reverse) {
        this.lf2.set_layout('entry')
      } else {
        this._opacity.play(true)
      }
    }
  }
}
