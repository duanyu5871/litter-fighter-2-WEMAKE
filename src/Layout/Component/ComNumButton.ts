import { LayoutComponent } from "./LayoutComponent";

export default class ComNumButton extends LayoutComponent {
  on_click(): void {
    const [which] = this.args;
  }
}
