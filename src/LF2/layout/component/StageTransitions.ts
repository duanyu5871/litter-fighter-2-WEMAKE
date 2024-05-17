import { ILf2Callback } from '../../ILf2Callback';
import { LayoutComponent } from './LayoutComponent';


export default class StageTransitions extends LayoutComponent implements ILf2Callback {
  override on_mount(): void {
    super.on_mount();
    this.lf2.callbacks.add(this)
  }
  override on_unmount(): void {
    super.on_unmount();
    this.lf2.callbacks.del(this)
  }
  on_enter_next_stage(): void {
    alert('!')
  }
}
