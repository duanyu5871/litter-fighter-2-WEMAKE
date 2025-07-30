import FSM, { IState } from "../../base/FSM";
import Invoker from "../../base/Invoker";
import Ditto, { IPointingEvent } from "../../ditto";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { IUIPointerEvent } from "../IUIPointerEvent";
import type { UINode } from "../UINode";
import { FadeOutOpacity } from "./FadeOutOpacity";
import { ImgLoop } from "./ImgLoop";
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

export class LaunchPageLogic extends UIComponent {
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

  constructor(layout: UINode, f_name: string) {
    super(layout, f_name);
    // this.__debugging = true
    this.fsm = new FSM<Status>().add({
      key: Status.TapHints,
      enter: () => {
        this.node.search_component(ImgLoop, 'loading', (c) => {
          c.anim.set_times(this._prel_loaded ? 1 : 0).set_count(0)
        })
        this.tap_to_launch.find_component(SineOpacity)!.enabled = true;
        this.sound_warning.find_component(SineOpacity)!.enabled = true;
        this.tap_to_launch.find_component(FadeOutOpacity)!.enabled = false;
        this.sound_warning.find_component(FadeOutOpacity)!.enabled = false;
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
        this.yeonface.find_component(ScaleAnimation, 'scale_in', c => {
          c.start(false);
        })
        this.yeonface.find_component(PositionAnimation, 'move_in', c => {
          c.start(false);
        })
        this.yeonface.find_component(OpacityAnimation, void 0, c => {
          c.start(false);
        })
        this.bearface.find_component(ScaleAnimation, 'scale_in', c => {
          c.start(false);
        })
        this.bearface.find_component(PositionAnimation, 'move_in', c => {
          c.start(false);
        })
        this.bearface.find_component(OpacityAnimation, void 0, c => {
          c.start(false);
        })
        this.long_text.find_component(PositionAnimation, 'move_in', c => {
          c.start(false);
        })
        this.long_text.find_component(OpacityAnimation, 'opacity', c => {
          c.start(false)
        });
      },
      leave: () => {
        this.yeonface.find_component(OpacityAnimation, void 0, c => {
          c.start(true)
          c.update(c.anim.anims[c.anim.anims.length - 1]!.duration)
        })
        this.bearface.find_component(OpacityAnimation, void 0, c => {
          c.start(true)
          c.update(c.anim.anims[c.anim.anims.length - 1]!.duration)
        })
        this.yeonface.find_component(ScaleAnimation, 'scale_out', c => {
          c.start(false);
        })
        this.bearface.find_component(ScaleAnimation, 'scale_out', c => {
          c.start(false);
        })
        this.long_text.find_component(OpacityAnimation, void 0, c => {
          c.start(true)
          c.update(c.anim.anims[c.anim.anims.length - 1]!.duration)
        })
      },
      update: (dt) => {
        if (this._prel_loaded && this.long_text.find_component(OpacityAnimation)!.done)
          return Status.GoToEntry
      }
    }, {
      key: Status.GoToEntry,
      enter: () => {
        this.lf2.sounds.play_bgm("launch/main.wma.mp3");
      },
      update: (dt) => {
        if (this.long_text.find_component(OpacityAnimation)!.done) {
          this.lf2.set_ui(this.entry_name);
          return Status.End
        }
      }
    }, {
      key: Status.End,
      update: (dt) => { }
    })
  }
  protected on_prel_loaded() {
    this._prel_loaded = true;
    this.node.search_component(ImgLoop, 'loading', (c) => { c.anim.set_times(4).set_count(0) })
  }
  override on_start(): void {
    this._prel_loaded = this.lf2.uiinfos_loaded
  }
  override init(...args: string[]): this {
    super.init(...args);
    this.lf2.sounds.load("launch/093.wav.mp3", "launch/093.wav.mp3");
    this.lf2.sounds.load("launch/main.wma.mp3", "launch/main.wma.mp3");
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
    this.fsm.use(Status.TapHints)
  }
  override on_key_down(e: IUIKeyEvent): void {
    this.debug('on_key_down', e)
    this.on_tap();
    e.stop_immediate_propagation()
  }
  override on_click(e: IUIPointerEvent): void {
    this.debug('on_click')
    this.on_tap()
    e.stop_immediate_propagation()
  }
  on_tap() {
    const status = this.fsm.state?.key
    switch (status) {
      case Status.TapHints:
        this.fsm.use(Status.Introduction);
        return;
    }
    return true;
  }
  override update(dt: number): void {
    this.fsm.update(dt);
  }
}
