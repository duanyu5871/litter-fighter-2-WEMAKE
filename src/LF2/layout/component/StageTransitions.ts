import { ILf2Callback } from "../../ILf2Callback";
import { LayoutComponent } from "./LayoutComponent";

export default class StageTransitions
  extends LayoutComponent
  implements ILf2Callback
{
  override on_resume(): void {
    super.on_resume();
    this.lf2.callbacks.add(this);
  }
  override on_pause(): void {
    super.on_pause();
    this.lf2.callbacks.del(this);
  }
  on_enter_next_stage(): void {
    alert("!");
  }
}
