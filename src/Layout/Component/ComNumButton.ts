import { Log } from "../../Log";
import { LayoutComponent } from "./LayoutComponent";

export default class ComNumButton extends LayoutComponent {
  get which(): string { return this.args[0] || '' }
  on_click(): void {
    const [which] = this.args;
  }
  on_mount(): void { }
  @Log
  on_show(): void { }
  @Log
  on_hide(): void { }
}
