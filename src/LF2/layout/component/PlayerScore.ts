import { PlayerInfo } from "../../PlayerInfo";
import Invoker from "../../base/Invoker";
import { LayoutComponent } from "./LayoutComponent";

export default class PlayerScore extends LayoutComponent {
  get player_id(): string { return this.args[0] || ''; }
  get player(): PlayerInfo | undefined { return this.lf2.player_infos.get(this.player_id) }

  private _unmount_job = new Invoker()

  override on_resume(): void {
    super.on_resume()
    this._unmount_job.add(
      this.player?.callbacks.add({
        on_joined_changed: v => this.layout.visible = v
      })
    )
    this.layout.visible = !!this.player?.joined
  }

  override on_pause(): void {
    super.on_resume();
    this._unmount_job.invoke_and_clear()
  }
}