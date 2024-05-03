import { ILf2Callback } from '../../LF2/ILf2Callback';
import { LayoutComponent } from './LayoutComponent';


export class StageTransitions extends LayoutComponent implements ILf2Callback {
  override on_mount(): void {
    this.lf2.callbacks.add(this, ['on_enter_next_stage'])
  }
  override on_unmount(): void {
    this.lf2.callbacks.del(this)
  }
  on_enter_next_stage(): void {
    alert('!')
  }
}
