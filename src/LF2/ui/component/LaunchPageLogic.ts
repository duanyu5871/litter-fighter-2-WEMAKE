import { ISprite } from "../../3d/ISprite";
import Easing from "../../animation/Easing";
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
import { PositionAnimation } from "./PositionAnimation";
import { ScaleAnimation } from "./ScaleAnimation";
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
  protected _unmount_jobs = new Invoker();
  protected _loading_sprite: ISprite;
  protected _loading_imgs: TPicture[] = [];
  protected _loading_idx_anim = new Easing(0, 44).set_duration(2000)
    .set_ease_method(ease_linearity)
    .set_loops(-1)
    .set_fill_mode(1)


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
        this.yeonface.find_component(ScaleAnimation, 'scale_in')!.start(false);
        this.yeonface.find_component(PositionAnimation, 'move_in')!.start(false);
        this.yeonface.find_component(OpacityAnimation)!.direction = 1;

        this.bearface.find_component(ScaleAnimation, 'scale_in')!.start(false);
        this.bearface.find_component(PositionAnimation, 'move_in')!.start(false);
        this.bearface.find_component(OpacityAnimation)!.direction = 1;

        this.long_text.find_component(PositionAnimation, 'move_in')!.start(false);
        this.long_text.find_component(OpacityAnimation)!.direction = 1;

      },
      leave: () => {
        this.yeonface.find_component(OpacityAnimation)!.direction = -1;
        this.yeonface.find_component(ScaleAnimation, 'scale_out')!.start(false);

        this.bearface.find_component(OpacityAnimation)!.direction = -1;
        this.bearface.find_component(ScaleAnimation, 'scale_out')!.start(false);

        const c = this.long_text.find_component(OpacityAnimation)!
        c.anim.start(true).update(5000)
      },
      update: (dt) => {
        if (this._prel_loaded && this.long_text.find_component(OpacityAnimation)!.is_end)
          return Status.GoToEntry
      }
    }, {
      key: Status.GoToEntry,
      enter: () => {
        this.lf2.sounds.play_bgm("launch/main.wma.mp3");
      },
      update: (dt) => {
        if (this.long_text.find_component(OpacityAnimation)!.is_end) {
          this.lf2.set_ui(this.entry_name);
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
    this.bearface = this.node.find_child("bearface")!;
    this.yeonface = this.node.find_child("yeonface")!;
    this.tap_to_launch = this.node.find_child("tap_to_launch")!;
    this.sound_warning = this.node.find_child("sound_warning")!;
    this.long_text = this.node.find_child("long_text")!;
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
        this.fsm.use(Status.Introduction);
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

  override update(dt: number): void {
    this.update_loading_img(dt)
    this.fsm.update(dt);
  }
}
