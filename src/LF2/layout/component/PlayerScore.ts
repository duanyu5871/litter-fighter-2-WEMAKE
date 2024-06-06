import Invoker from "../../base/Invoker";
import Character from "../../entity/Character";
import { LayoutComponent } from "./LayoutComponent";

export default class PlayerScore extends LayoutComponent {
  private _hp_lost: number = 0;
  private _mp_usage: number = 0;
  get hp_lost() { return this._hp_lost }
  get mp_usage() { return this._mp_usage }
  get player_id(): string { return this.args[0] || ''; }
  get character(): Character | undefined {
    return this.lf2.player_characters.get(this.player_id)
  }
  private _unmount_job = new Invoker()

  override on_resume(): void {
    super.on_resume()
    this.layout.visible = !!this.character;

    this.character?.callbacks.add({
      on_hp_changed: (e, value, prev) => {
        if (value < prev) this._hp_lost += prev - value
      },
      on_mp_changed: (e, value, prev) => {
        if (value < prev) this._mp_usage += prev - value
      },
    })
  }

  override on_show(): void {
    super.on_show?.()
  }

  override on_pause(): void {
    super.on_resume();
    this._unmount_job.invoke_and_clear()
  }
}