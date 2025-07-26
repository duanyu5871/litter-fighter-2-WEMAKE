import { Animation, Delay, Easing, Sequence } from "../../animation";
import ease_linearity from "../../utils/ease_method/ease_linearity";
import { UIComponent } from "./UIComponent";

export class ScaleAnimation extends UIComponent {
  static override readonly TAG: string = "ScaleAnimation";
  protected seq_anim: Sequence = new Sequence();
  protected values = new Map<any, [[number, number, number], [number, number, number]]>()
  protected _direction: -1 | 1 = 1;
  set direction(v: -1 | 1) {
    this._direction = v;
  }
  get direction() {
    return this._direction // this.anim.direction
  }
  start(v?: boolean) {
    this.seq_anim.start(v)
    this._direction = this.seq_anim.direction
  }
  get is_end() {
    return this.seq_anim.done
  }
  override on_start(): void {
    super.on_start?.();
    const len = this.args.length;
    const anims: Animation[] = [];
    for (let i = 0; i < len - 2; i += 2) {
      const scale = this.nums(i + 2, 3) || this.node.scale;
      const duration = this.num(i + 3) || 0;
      const prev_scale = i == 0 ? scale : (this.nums(i, 3) || scale);
      const a = scale.join() === prev_scale.join() ?
        new Delay(0, duration) :
        new Easing(0, 1)
          .set_duration(duration)
          .set_ease_method(ease_linearity)

      this.values.set(a,
        [
          prev_scale, [
            scale[0] - prev_scale[0],
            scale[1] - prev_scale[1],
            scale[2] - prev_scale[2]
          ]
        ])
      anims.push(a)
    }
    this.seq_anim = new Sequence(...anims).set_fill_mode(1)
    const is_play = this.bool(0) ?? true;
    const is_reverse = this.bool(1) ?? false;
    if (is_play) this.seq_anim.start(is_reverse)
    else this.seq_anim.end(is_reverse)
    this._direction = this.seq_anim.direction
  }

  override update(dt: number): void {
    super.update?.(dt);
    if (!this.seq_anim.done) {
      this.seq_anim.update(dt);
      const pair = this.values.get(this.seq_anim.curr_anim)
      if (!pair) return;
      const { value } = this.seq_anim
      this.node.set_scale(
        pair[0][0] + pair[1][0] * value,
        pair[0][1] + pair[1][1] * value,
        pair[0][2] + pair[1][2] * value,
      )
    } else if (this._direction !== this.seq_anim.direction) {
      this.seq_anim.direction = this._direction;
      this.seq_anim.start();
    }
  }
}

