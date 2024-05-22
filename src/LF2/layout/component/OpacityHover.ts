import NumberAnimation from "../../animation/NumberAnimation";
import { is_nan } from "../../utils/type_check";
import { LayoutComponent } from "./LayoutComponent";

export default class OpacityHover extends LayoutComponent {
  protected anim = new NumberAnimation(0, 1, 150);
  override init(...args: string[]): this {
    const a = Number(args[0])
    const b = Number(args[1])
    const c = Number(args[2])
    this.anim.set(
      is_nan(a) ? 0 : a,
      is_nan(b) ? 1 : b,
      is_nan(c) ? 255 : c,
      false
    )
    return super.init(...args);
  }
  on_render(dt: number): void {
    const r = this.layout.state.mouse_on_me !== '1' && !this.layout.focused
    if (this.anim.reverse !== r) {
      this.anim.reverse = r
      this.anim.time = this.anim.duration - this.anim.time
    }
    this.layout.opacity = this.anim.update(dt);
  }
}
