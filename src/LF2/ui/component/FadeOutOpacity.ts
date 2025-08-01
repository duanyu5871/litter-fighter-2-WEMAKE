import { Delay, Easing, Sequence } from "../../animation";
import { UIComponent } from "./UIComponent";

export class FadeOutOpacity extends UIComponent {
  static override readonly TAG: string = 'FadeOutOpacity';
  protected anim: Sequence = new Sequence();
  override on_start(): void {
    super.on_start?.();
    this.anim = new Sequence(
      new Delay(this.node.opacity)
        .set_duration(this.num(1) ?? 0),
      new Easing(this.node.opacity, 0)
        .set_duration(this.num(0) ?? 1000)
        .set_val_1(this.node.opacity)
    )
  }
  override update(dt: number): void {
    super.update?.(dt);
    this.anim.update(dt);

    this.node.opacity = this.anim.value;
  }
}
