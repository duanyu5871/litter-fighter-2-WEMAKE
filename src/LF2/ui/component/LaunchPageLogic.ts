import { ISprite } from "../../3d/ISprite";
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
import { SineOpacity } from "./SineOpacity";
import { UIComponent } from "./UIComponent";

enum Status {
  TapHints = '0',
  Introduction = '1',
  Loaded = '2',
  GoToEntry = "GoToEntry",
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
  protected long_text_2!: UINode;
  protected _layouts_loaded: boolean = false;
  protected _dispose_jobs = new Invoker();
  protected _offset_x = new Sequence(
    1000,
    new Easing(0, 80, 500),
  );
  protected _scale = new Sequence(
    1000,
    new Easing(0, 2, 250),
    new Easing(2, 1, 250),
  );
  protected _opacity = new Sequence(
    1000,
    new Easing(0, 1, 500),
    250,
  );
  protected _unmount_jobs = new Invoker();
  protected _skipped = false;

  protected _tap_hints_opacity: Sine = new Sine(0.1, 1, 0.5);
  protected _tap_hints_fadeout_opacity = new Easing(1, 0, 255);

  protected _loading_sprite: ISprite;
  protected _loading_imgs: TPicture[] = [];
  protected _loading_idx_anim = new Easing(
      0,
      44,
      2000,
    ).set_ease_method(ease_linearity)

  constructor(layout: UINode, f_name: string) {
    super(layout, f_name);
    this._loading_sprite = new Ditto.SpriteNode(this.lf2);
    this.fsm = new FSM<Status>().add({
      key: Status.TapHints,
      enter: () => {
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
      update: (dt) => {
        this.update_Introduction(dt)
      }
    }, {
      key: Status.GoToEntry,
      enter: () => {
        this._opacity.play(true);
        this.lf2.sounds.play_bgm("launch/main.wma.mp3");
      },
      update: (dt) => {
        this.update_Introduction(dt)
      }
    })
  }

  protected on_prel_data_loaded() {
    this._layouts_loaded = true;
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
        on_prel_data_loaded: () => this.on_prel_data_loaded(),
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
    this._skipped = false;
    this.bearface = this.node.find_child("bearface")!;
    this.yeonface = this.node.find_child("yeonface")!;
    this.tap_to_launch = this.node.find_child("tap_to_launch")!;
    this.sound_warning = this.node.find_child("sound_warning")!;
    this.long_text = this.node.find_child("long_text")!;
    this.long_text_2 = this.node.find_child("long_text_2")!;
    this._tap_hints_opacity.time = 0;
    this._tap_hints_fadeout_opacity.time = 0;
    this.long_text.opacity = this.bearface.opacity = this.yeonface.opacity = 0;
    this.long_text_2.opacity = 0;

    this._scale.play(false);
    this._opacity.play(false);
    this._offset_x.play(false);
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
    switch (status) {
      case Status.TapHints:
        Ditto.Timeout.add(() => this.lf2.sounds.play("launch/093.wav.mp3"), 1000);
        this.fsm.use(Status.Introduction);
        return;
      case Status.Introduction:
        this._skipped = true;
        return;
      case Status.Loaded:
        this.fsm.use(Status.GoToEntry)
        return;
    }
  }
  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  update_loading_img(dt: number) {
    this._loading_idx_anim.update(dt)
    const idx = Math.floor(this._loading_idx_anim.value) % this._loading_imgs.length;
    const pic = this._loading_imgs[idx];
    if (pic) this._loading_sprite.set_info(pic).apply();
    if (this._loading_idx_anim.is_finish) this._loading_idx_anim.play();
  }

  update_Introduction(dt: number) {
    const { bearface, yeonface, long_text } = this;
    const scale = this._scale.update(dt).value;
    const offset = this._offset_x.update(dt).value;
    const opacity = this._opacity.update(dt).value;
    bearface.sprite.x = 397 - offset;
    yeonface.sprite.x = 397 + offset;
    long_text.sprite.y = -150 - offset;
    long_text.opacity = bearface.opacity = yeonface.opacity = opacity;
    if (this._opacity.reverse) {
      const s = 0.1 + 0.9 * opacity;
      bearface.sprite.set_scale(s, s, 1);
      yeonface.sprite.set_scale(s, s, 1);
      yeonface.sprite.set_scale(s, s, 1);
    } else {
      bearface.sprite.set_scale(scale, scale, 1);
      yeonface.sprite.set_scale(scale, scale, 1);
      yeonface.sprite.set_scale(scale, scale, 1);
    }
  }

  override update(dt: number): void {
    this.fsm.update(dt);
    // if (
    //   this.status === Status.Loaded ||
    //   this.status === 2 ||
    //   this.status === 3
    // ) {
    //   this.sound_warning.opacity = this.tap_to_launch.opacity =
    //     this._tap_hints_fadeout_opacity.update(dt).value;

    //   if (this.status === 3) {
    //     this.long_text_2.opacity = opacity;
    //   } else if (this.lf2.uiinfos.find((v) => v.id === "entry")) {
    //     this._tap_hints_opacity.update(dt)
    //     this.long_text_2.opacity = this._tap_hints_opacity.value;
    //   }
    //   this.long_text.visible = this.long_text.opacity > 0;
    //   this.long_text_2.visible = this.long_text_2.opacity > 0;

    //   if (this._opacity.is_end && this._layouts_loaded) {
    //     if (this._opacity.reverse) {
    //       this.lf2.set_layout("entry");
    //     } else if (this._skipped) {
    //       this.fsm.use(Status.GoToEntry)
    //     } else {
    //       this.status = 2;
    //     }
    //   }
    // }
  }
}
