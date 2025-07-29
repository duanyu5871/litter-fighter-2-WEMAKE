import { Animation, Delay, Easing, Sequence } from "../../animation";
import ease_linearity from "../../utils/ease_method/ease_linearity";
import { UIComponent } from "./UIComponent";


export class PositionAnimation extends UIComponent {
  static override readonly TAG: string = "PositionAnimation";
  protected seq_anim: Sequence = new Sequence();
  protected values = new Map<any, [[number, number, number], [number, number, number]]>()
  start(v?: boolean) {
    this.enabled = true;
    this.seq_anim.start(v)
  }
  get is_end() {
    return this.seq_anim.done
  }
  override on_start(): void {
    super.on_start?.();
    const len = this.args.length;
    const anims: Animation[] = [];
    for (let i = 0; i < len - 2; i += 2) {
      const value = this.nums(i + 2, 3) || this.node.pos;
      const duration = this.num(i + 3) || 0;
      const prev_value = i == 0 ? value : (this.nums(i, 3) || value);
      const a = value.join() === prev_value.join() ?
        new Delay(0)
          .set_duration(duration) :
        new Easing(0, 1)
          .set_duration(duration)
          .set_ease_method(ease_linearity)
      // new Sine(0, 1)
      //   .set_offset(-250)
      //   .set_scale(duration / 500)
      //   .set_duration(duration)
      this.values.set(a,
        [
          prev_value, [
            value[0] - prev_value[0],
            value[1] - prev_value[1],
            value[2] - prev_value[2]
          ]
        ])
      anims.push(a)
    }
    this.seq_anim = new Sequence(...anims).set_fill_mode(1)
    const is_play = this.bool(0) ?? true;
    const is_reverse = this.bool(1) ?? false;
    if (is_play) this.seq_anim.start(is_reverse)
    else this.seq_anim.end(is_reverse)
  }

  override update(dt: number): void {
    super.update?.(dt);
    if (!this.seq_anim.done) {
      this.seq_anim.update(dt);
      const pair = this.values.get(this.seq_anim.curr_anim)
      if (!pair) return;
      const { value } = this.seq_anim
      this.node.set_pos(
        pair[0][0] + pair[1][0] * value,
        pair[0][1] + pair[1][1] * value,
        pair[0][2] + pair[1][2] * value,
      )
    } else {
      this.set_enabled(false)
    }
  }
}