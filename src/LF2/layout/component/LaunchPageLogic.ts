import NumberAnimation from "../../animation/NumberAnimation";
import SequenceAnimation from "../../animation/SequenceAnimation";
import { SineAnimation } from "../../animation/SineAnimation";
import Invoker from "../../base/Invoker";
import { TKeyName } from "../../controller/BaseController";
import Timeout from "../../dom/Timeout";
import Layout from "../Layout";
import { LayoutComponent } from "./LayoutComponent";

export default class LaunchPageLogic extends LayoutComponent {
  get entry_name(): string { return this.args[0] || '' }
  protected tap_to_launch!: Layout;
  protected yeonface!: Layout;
  protected bearface!: Layout;
  protected long_text!: Layout;
  protected sound_warning!: Layout;
  protected _layouts_loaded: boolean = false;
  protected _dispose_jobs = new Invoker();
  protected _offset_x = new SequenceAnimation(1000, new NumberAnimation(0, 80, 500));
  protected _scale = new SequenceAnimation(1000, new NumberAnimation(0, 2, 250), new NumberAnimation(2, 1, 250));
  protected _opacity = new SequenceAnimation(1000, new NumberAnimation(0, 1, 500), 1000);
  protected _unmount_jobs = new Invoker();

  protected _tap_hints_opacity = new SineAnimation(.2, 1, 0.002)
  protected _tap_hints_fadeout_opacity = new NumberAnimation(1, 0, 255)
  protected state: number = 0;

  protected on_layouts_loaded() {
    this._layouts_loaded = true;
  }

  override init(...args: string[]): this {
    super.init(...args);
    this.lf2.sounds.load('data/093.wav.ogg', 'data/093.wav.ogg')
    this.lf2.sounds.load('data/m_cancel.wav.ogg', 'data/m_cancel.wav.ogg')
    this.lf2.sounds.load('data/m_end.wav.ogg', 'data/m_end.wav.ogg')
    this.lf2.sounds.load('data/m_join.wav.ogg', 'data/m_join.wav.ogg')
    this.lf2.sounds.load('data/m_ok.wav.ogg', 'data/m_ok.wav.ogg')
    this.lf2.sounds.load('data/m_pass.wav.ogg', 'data/m_pass.wav.ogg')
    this.lf2.sounds.load('launch/093.wav.ogg', 'launch/main.wma.ogg')
    this._dispose_jobs.add(
      this.lf2.callbacks.add({
        on_layouts_loaded: () => this.on_layouts_loaded(),
      })
    )
    return this;
  }
  override on_stop(): void {
    this._dispose_jobs.invoke();
    this._dispose_jobs.clear();
  }
  override on_resume(): void {
    super.on_resume();
    this.bearface = this.layout.find_layout('bearface')!
    this.yeonface = this.layout.find_layout('yeonface')!
    this.tap_to_launch = this.layout.find_layout('tap_to_launch')!
    this.sound_warning = this.layout.find_layout('sound_warning')!
    this.long_text = this.layout.find_layout('long_text')!

    this.state = 0;
    this._tap_hints_opacity.time = 0;
    this._tap_hints_fadeout_opacity.time = 0;
    this.long_text.opacity = this.bearface.opacity = this.yeonface.opacity = 0;

    this._scale.play(false);
    this._opacity.play(false);
    this._offset_x.play(false);
    this._unmount_jobs.add(
      this.lf2.pointings.callback.add({
        on_pointer_down: () => this.on_pointer_down()
      })
    )
  }

  on_player_key_down(player_id: string, key: TKeyName): void {
    this.on_pointer_down()
  }
  on_pointer_down() {
    if (this.state === 0) {
      this.state = 1;
      Timeout.set(() => this.lf2.sounds.play('data/093.wav.ogg'), 1000)
    } else if (this.state === 2) {
      this.state = 3;
      this._opacity.play(true);
      this.lf2.sounds.play_bgm('launch/093.wav.ogg')
    }
  }
  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  override on_render(dt: number): void {
    if (this.state === 0) {
      this.sound_warning.opacity = this.tap_to_launch.opacity = this._tap_hints_opacity.update(dt);

    } else if (this.state === 1 || this.state === 2 || this.state === 3) {
      this.sound_warning.opacity = this.tap_to_launch.opacity = this._tap_hints_fadeout_opacity.update(dt);
      const { bearface, yeonface, long_text } = this;
      const scale = this._scale.update(dt);
      const offset = this._offset_x.update(dt)
      const opacity = this._opacity.update(dt)
      bearface.sprite.x = 397 - offset;
      yeonface.sprite.x = 397 + offset;
      long_text.sprite.y = -150 - offset;
      long_text.opacity = bearface.opacity = yeonface.opacity = opacity
      if (this._opacity.reverse) {
        const s = 0.1 + 0.9 * opacity
        bearface.sprite.mesh.scale.set(s, s, 1);
        yeonface.sprite.mesh.scale.set(s, s, 1);
        yeonface.sprite.mesh.scale.set(s, s, 1);
      } else {
        bearface.sprite.mesh.scale.set(scale, scale, 1);
        yeonface.sprite.mesh.scale.set(scale, scale, 1);
        yeonface.sprite.mesh.scale.set(scale, scale, 1);
      }
      if (this._opacity.is_finish && this._layouts_loaded) {
        if (this._opacity.reverse) {
          this.lf2.set_layout('entry')
        } else {
          this.state = 2;
        }
      }
    }
  }
}
