import { Animation, Delay, Easing, Sequence } from "../../animation";
import { UIComponent } from "./UIComponent";

export class OpacityAnimation extends UIComponent {
  static TAG: string = "OpacityAnimation";
  protected anim: Animation = new Delay(0, 1000);
  set direction(v: -1 | 1) {
    this.anim.direction = v;
    this.anim.count = 0;
  }
  get direction() {
    return this.anim.direction
  }
  override on_start(): void {
    super.on_start?.();
    const len = this.args.length;
    const anims: Animation[] = [];
    for (let i = 0; i < len - 2; i += 2) {
      const opacity = this.num(2 + i) || 0;
      const duration = this.num(2 + i + 1) || 0;
      const prev_opacity = this.num(2 + i - 2) ?? opacity;
      anims.push(
        prev_opacity === opacity ?
          new Delay(opacity, duration) :
          new Easing(prev_opacity, opacity).set_duration(duration)
      )
    }
    this.anim = new Sequence(...anims).wrap(1)
    const is_play = this.bool(0) ?? true;
    const is_reverse = this.bool(1) ?? false;
    if (is_play) this.anim.start(is_reverse)
    else this.anim.end(is_reverse)
  }

  override update(dt: number): void {
    super.update?.(dt);
    this.node.opacity = this.anim.update(dt).value;
  }
}
