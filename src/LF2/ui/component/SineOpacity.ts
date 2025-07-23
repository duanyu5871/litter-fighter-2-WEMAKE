import { Sine } from "../../animation/Sine";
import { UIComponent } from "./UIComponent";
export class SineOpacity extends UIComponent {
  protected anim: Sine = new Sine(0, 1, 1);
  override on_start(): void {
    super.on_start?.();
    this.anim.set(
      this.get_num_arg(0) ?? 0,
      this.get_num_arg(1) ?? 1,
      this.get_num_arg(2) ?? 1,
    );
  }
  override update(dt: number): void {
    super.update?.(dt);
    this.anim.update(dt);
    this.node.opacity = this.anim.value;
  }
}
