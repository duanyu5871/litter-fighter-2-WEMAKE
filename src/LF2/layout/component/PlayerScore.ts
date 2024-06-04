import Invoker from "../../base/Invoker";
import Character from "../../entity/Character";
import { LayoutComponent } from "./LayoutComponent";

export default class PlayerScore extends LayoutComponent {
  get player_id(): string { return this.args[0] || ''; }
  get character(): Character | undefined {
    return this.lf2.player_characters.get(this.player_id)
  }
  private _unmount_job = new Invoker()

  override on_resume(): void {
    super.on_resume()
    this.layout.visible = !!this.character;
  }

  override on_show(): void {
    super.on_show?.()
  }

  override on_pause(): void {
    super.on_resume();
    this._unmount_job.invoke_and_clear()
  }
}