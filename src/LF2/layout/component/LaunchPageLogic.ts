
import Sprite from "../../3d/Sprite";
import NumberAnimation from "../../animation/NumberAnimation";
import SequenceAnimation from "../../animation/SequenceAnimation";
import { SineAnimation } from "../../animation/SineAnimation";
import Invoker from "../../base/Invoker";
import GameKey from "../../defines/GameKey";
import Ditto from "../../ditto";
import ease_linearity from "../../ease_method/ease_linearity";
import { TPicture } from "../../loader/loader";
import { make_arr } from "../../utils/array/make_arr";
import Layout from "../Layout";
import { LayoutComponent } from "./LayoutComponent";

export default class LaunchPageLogic extends LayoutComponent {
  get entry_name(): string { return this.args[0] || '' }
  protected tap_to_launch!: Layout;
  protected yeonface!: Layout;
  protected bearface!: Layout;
  protected long_text!: Layout;
  protected long_text_2!: Layout;
  protected sound_warning!: Layout;

  protected _layouts_loaded: boolean = false;
  protected _dispose_jobs = new Invoker();
  protected _offset_x = new SequenceAnimation(1000, new NumberAnimation(0, 80, 500));
  protected _scale = new SequenceAnimation(1000, new NumberAnimation(0, 2, 250), new NumberAnimation(2, 1, 250));
  protected _opacity = new SequenceAnimation(1000, new NumberAnimation(0, 1, 500), 250);
  protected _unmount_jobs = new Invoker();
  protected _skipped = false;

  protected _tap_hints_opacity = new SineAnimation(.1, 1, 0.002)
  protected _tap_hints_fadeout_opacity = new NumberAnimation(1, 0, 255)
  protected state: number = 0;

  protected _loading_sprite = new Sprite();
  protected _loading_imgs: TPicture[] = [];
  protected _loading_idx_anim = new NumberAnimation(0, 44, 2000).set_ease_method(ease_linearity)

  protected on_prel_data_loaded() {
    this._layouts_loaded = true;
  }

  override init(...args: string[]): this {
    super.init(...args);
    this.lf2.sounds.load('launch/093.wav.mp3', 'launch/093.wav.mp3')
    this.lf2.sounds.load('launch/main.wma.mp3', 'launch/main.wma.mp3')

    const max_col = 15;
    const cell_w = 33 * 4;
    const cell_h = 21 * 4;
    const jobs = make_arr(44, async i => {
      const x = cell_w * (i % max_col);
      const y = cell_h * Math.floor(i / max_col);
      const info = await this.lf2.images.load_img("SMALL_LOADING_" + i, "launch/SMALL_LOADING.png", (img, canvas, ctx) => {
        const w = canvas.width = cell_w;
        const h = canvas.height = cell_h;
        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
      });
      return this.lf2.images.create_pic_by_img_info(info);
    })
    Promise.all(jobs).then(s => this._loading_imgs = s);
    this.layout.sprite.add(this._loading_sprite.set_pos(this.layout.w - 33, -this.layout.h + 21))

    this._dispose_jobs.add(
      this.lf2.callbacks.add({
        on_prel_data_loaded: () => this.on_prel_data_loaded(),
      })
    )
    return this;
  }
  override on_stop(): void {
    super.on_stop?.()
    this._dispose_jobs.invoke();
    this._dispose_jobs.clear();
  }
  override on_resume(): void {
    super.on_resume();
    this._skipped = false;
    this.bearface = this.layout.find_layout('bearface')!
    this.yeonface = this.layout.find_layout('yeonface')!
    this.tap_to_launch = this.layout.find_layout('tap_to_launch')!
    this.sound_warning = this.layout.find_layout('sound_warning')!
    this.long_text = this.layout.find_layout('long_text')!
    this.long_text_2 = this.layout.find_layout('long_text_2')!

    this.state = 0;
    this._tap_hints_opacity.time = 0;
    this._tap_hints_fadeout_opacity.time = 0;
    this.long_text.opacity = this.bearface.opacity = this.yeonface.opacity = 0;
    this.long_text_2.opacity = 0;

    this._scale.play(false);
    this._opacity.play(false);
    this._offset_x.play(false);
    this._unmount_jobs.add(
      this.lf2.pointings.callback.add({
        on_pointer_down: () => this.on_pointer_down()
      })
    )
  }

  on_player_key_down(player_id: string, key: GameKey): void {
    this.on_pointer_down()
  }
  on_pointer_down() {
    if (this.state === 0) {
      this.state = 1;
      Ditto.Timeout.add(() => this.lf2.sounds.play('launch/093.wav.mp3'), 1000)
    } else if (this.state === 1) {
      this._skipped = true;
    } else if (this.state === 2) {
      this.state = 3;
      this._opacity.play(true);
      this.lf2.sounds.play_bgm('launch/main.wma.mp3')
    }
  }
  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  override on_render(dt: number): void {
    if (this._loading_imgs.length && !this._loading_idx_anim.is_finish) {
      const idx = Math.floor(this._loading_idx_anim.update(dt))
      const pic = this._loading_imgs[idx]
      if (pic) this._loading_sprite.set_info(pic).apply()
      if (this._loading_idx_anim.is_finish && !this.lf2.layout_infos.find(v => v.id === 'entry'))
        this._loading_idx_anim.play()
    }

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
        bearface.sprite.inner.scale.set(s, s, 1);
        yeonface.sprite.inner.scale.set(s, s, 1);
        yeonface.sprite.inner.scale.set(s, s, 1);
      } else {
        bearface.sprite.inner.scale.set(scale, scale, 1);
        yeonface.sprite.inner.scale.set(scale, scale, 1);
        yeonface.sprite.inner.scale.set(scale, scale, 1);
      }
      if (this.state === 3) {
        this.long_text_2.opacity = opacity
      } else if (this.lf2.layout_infos.find(v => v.id === 'entry')) {
        this.long_text_2.opacity = this._tap_hints_opacity.update(dt)
      }

      if (this._opacity.is_finish && this._layouts_loaded) {
        if (this._opacity.reverse) {
          this.lf2.set_layout('entry')
        } else if (this._skipped) {
          this.state = 3;
          this._opacity.play(true);
          this.lf2.sounds.play_bgm('launch/main.wma.mp3')
        } else {
          this.state = 2;
        }
      }
    }
  }
}
