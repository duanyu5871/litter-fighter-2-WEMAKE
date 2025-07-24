import { ISprite } from "../../3d/ISprite";
import { Delay } from "../../animation";
import Easing from "../../animation/Easing";
import Sequence from "../../animation/Sequence";
import { Sine } from "../../animation/Sine";
import FSM, { IState } from "../../base/FSM";
import Invoker from "../../base/Invoker";
import GameKey from "../../defines/GameKey";
import Ditto from "../../ditto";
import { TPicture } from "../../loader/ImageMgr";
import { make_arr } from "../../utils/array/make_arr";
import ease_linearity from "../../utils/ease_method/ease_linearity";
import type { UINode } from "../UINode";
import { FadeOutOpacity } from "./FadeOutOpacity";
import { OpacityAnimation } from "./OpacityAnimation";
import { SineOpacity } from "./SineOpacity";
import { UIComponent } from "./UIComponent";


enum Status {
  TapHints = 'TapHints',
  Introduction = 'Introduction',
  GoToEntry = "GoToEntry",
  End = "End",
}

export default class LaunchPageLogic extends UIComponent {
  protected fsm: FSM<Status, IState<Status>>;
  get entry_name(): string {
    return this.args[0] || "";
  }
  protected tap_to_launch!: UINode;
  protected sound_warning!: UINode;
  protected yeonface!: UINode;
  protected bearface!: UINode;
  protected long_text!: UINode;
  protected _prel_loaded: boolean = false;
  protected _dispose_jobs = new Invoker();
  protected _offset_x = new Sequence(
    new Delay(0, 1000),
    new Easing(0, 80).set_duration(1000),
  );
  protected _scale = new Sequence(
    new Delay(0, 1000),
    new Easing(0, 2).set_duration(500),
    new Easing(2, 1).set_duration(500),
  );
  protected _unmount_jobs = new Invoker();
  protected _tapped = false;
  protected _tap_hints_opacity: Sine = new Sine(0.1, 1, 0.5);
  protected _tap_hints_fadeout_opacity = new Easing(1, 0).set_duration(255);
  protected _loading_sprite: ISprite;
  protected _loading_imgs: TPicture[] = [];
  protected _loading_idx_anim = new Easing(0, 44).set_duration(2000)
    .set_ease_method(ease_linearity)
    .set_loops(-1)
    .wrap(1)

  constructor(layout: UINode, f_name: string) {
    super(layout, f_name);
    this._loading_sprite = new Ditto.SpriteNode(this.lf2);
    this.fsm = new FSM<Status>().add({
      key: Status.TapHints,
      enter: () => {
        if (this._prel_loaded)
          this._loading_idx_anim.set_loops(1).set_count(0)
        else
          this._loading_idx_anim.set_loops(-1)
        this.tap_to_launch.find_component(SineOpacity)!.enabled = true;
        this.sound_warning.find_component(SineOpacity)!.enabled = true;
        this.tap_to_launch.find_component(FadeOutOpacity)!.enabled = false
        this.sound_warning.find_component(FadeOutOpacity)!.enabled = false
      },
      update: (dt) => {
        this.update_loading_img(dt)
      },
      leave: () => {
        this.tap_to_launch.find_component(SineOpacity)!.enabled = false
        this.sound_warning.find_component(SineOpacity)!.enabled = false
        this.tap_to_launch.find_component(FadeOutOpacity)!.enabled = true
        this.sound_warning.find_component(FadeOutOpacity)!.enabled = true
      }
    }, {
      key: Status.Introduction,
      enter: () => {
        Ditto.Timeout.add(() => this.lf2.sounds.play("launch/093.wav.mp3"), 1000);
        this.yeonface.find_component(OpacityAnimation)!.direction = 1;
        this.bearface.find_component(OpacityAnimation)!.direction = 1;
        this.long_text.find_component(OpacityAnimation)!.direction = 1;
        this._scale.start(false)
      },
      leave: () => {
        this.yeonface.find_component(OpacityAnimation)!.direction = -1;
        this.bearface.find_component(OpacityAnimation)!.direction = -1;
        this.long_text.find_component(OpacityAnimation)!.direction = -1;
      },
      update: (dt) => {
        this.update_loading_img(dt)
        this.update_introduction(dt)
        if (this._tapped && this.long_text.find_component(OpacityAnimation)!.is_end && this._prel_loaded)
          return Status.GoToEntry
      }
    }, {
      key: Status.GoToEntry,
      enter: () => {
        this._scale.start(true)
        this.lf2.sounds.play_bgm("launch/main.wma.mp3");
      },
      update: (dt) => {
        this.update_loading_img(dt)
        this.update_introduction(dt)
        if (this.long_text.find_component(OpacityAnimation)!.is_end) {
          this.lf2.set_layout(this.entry_name);
          return Status.End
        }
      }
    }, {
      key: Status.End,
      update: (dt) => {
        this.update_loading_img(dt)
      }
    })
  }

  protected on_prel_loaded() {
    this._prel_loaded = true;
    this._loading_idx_anim.set_loops(4).set_count(0)
  }
  override on_start(): void {
    this._prel_loaded = this.lf2.uiinfos_loaded
  }
  override init(...args: string[]): this {
    super.init(...args);
    this.lf2.sounds.load("launch/093.wav.mp3", "launch/093.wav.mp3");
    this.lf2.sounds.load("launch/main.wma.mp3", "launch/main.wma.mp3");
    const max_col = 15;
    const cell_w = 33 * 4;
    const cell_h = 21 * 4;
    const jobs = make_arr(44, async (i) => {
      const x = cell_w * (i % max_col);
      const y = cell_h * Math.floor(i / max_col);
      const info = await this.lf2.images.load_img(
        "SMALL_LOADING_" + i,
        "launch/SMALL_LOADING.png",
        [{
          type: 'crop',
          x, y, w: cell_w, h: cell_h,
        }]
      );
      return this.lf2.images.create_pic_by_img_info(info);
    });
    Promise.all(jobs).then((s) => { this._loading_imgs = s });
    this.node.sprite.add(
      this._loading_sprite.set_position(
        this.node.w - 33,
        -this.node.h + 21,
        0,
      ),
    );
    this._dispose_jobs.add(
      this.lf2.callbacks.add({
        on_prel_loaded: () => this.on_prel_loaded(),
      }),
    );
    return this;
  }
  override on_stop(): void {
    super.on_stop?.();
    this._dispose_jobs.invoke();
    this._dispose_jobs.clear();
  }
  override on_resume(): void {
    super.on_resume();
    this._tapped = false;
    this.bearface = this.node.find_child("bearface")!;
    this.yeonface = this.node.find_child("yeonface")!;
    this.tap_to_launch = this.node.find_child("tap_to_launch")!;
    this.sound_warning = this.node.find_child("sound_warning")!;
    this.long_text = this.node.find_child("long_text")!;
    this.long_text.renderer.__debugging = true;
    this._tap_hints_opacity.time = 0;
    this._tap_hints_fadeout_opacity.time = 0;
    this._scale.start(false);
    this._offset_x.start(false);
    this._unmount_jobs.add(
      this.lf2.pointings.callback.add({
        on_pointer_down: () => this.on_pointer_down(),
      }),
    );
    this.fsm.use(Status.TapHints)
  }
  override on_player_key_down(player_id: string, key: GameKey): void {
    this.on_pointer_down();
  }
  on_pointer_down() {
    const status = this.fsm.state?.key
    this._tapped = true
    switch (status) {
      case Status.TapHints:
        this.fsm.use(Status.Introduction);
        return;
      case Status.Introduction:
        this.fsm.use(Status.GoToEntry)
        return;
    }
  }
  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }
  update_loading_img(dt: number) {
    if (!this._loading_imgs.length) return;
    this._loading_idx_anim.update(dt)
    const idx = Math.floor(this._loading_idx_anim.value);
    const pic = this._loading_imgs[idx];
    if (pic) this._loading_sprite.set_info(pic).apply();
  }

  update_introduction(dt: number) {
    const { bearface, yeonface } = this;
    const { long_text } = this;
    const scale = this._scale.update(dt).value;
    const offset = this._offset_x.update(dt).value;
    bearface.x = 397 - offset;
    yeonface.x = 397 + offset;
    long_text.y = 150 + offset;
    if (this.fsm.state?.key !== Status.Introduction) {
      const s = bearface.opacity;
      bearface.set_scale(s, s);
      yeonface.set_scale(s, s);
    } else {
      bearface.set_scale(scale, scale);
      yeonface.set_scale(scale, scale);
    }
  }

  override update(dt: number): void {
    this.fsm.update(dt);
  }
}
