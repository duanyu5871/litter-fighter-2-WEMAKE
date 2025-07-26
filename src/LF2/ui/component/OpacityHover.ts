import Easing from "../../animation/Easing";
import { UIComponent } from "./UIComponent";

export default class OpacityHover extends UIComponent {
  protected anim = new Easing(0, 1).set_duration(150);

  override on_start(): void {
    super.on_start?.();
    this.anim.set(
      this.num(0) ?? 0,
      this.num(1) ?? 1,
    ).set_duration(
      this.num(2) ?? 255
    ).set_reverse(false);
  }

  override update(dt: number): void {
    const r = this.node.state.mouse_on_me !== "1" && !this.node.focused;
    if (this.anim.reverse !== r) {
      if (this.anim.done)
        this.anim.start(r)
      else
        this.anim.reverse = r;
    }
    this.node.opacity = this.anim.update(dt).value;
  }
}
