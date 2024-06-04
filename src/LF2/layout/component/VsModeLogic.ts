import ICharacterCallbacks from "../../entity/ICharacterCallbacks";
import { LayoutComponent } from "./LayoutComponent";

export default class VsModeLogic extends LayoutComponent implements ICharacterCallbacks {
  override on_start(): void {
    super.on_start?.()
    for (const [, v] of this.lf2.player_characters) {
      v.callbacks.add(this)
    }
  }
  override on_stop(): void {
    super.on_stop?.()
    for (const [, v] of this.lf2.player_characters) {
      v.callbacks.del(this)
    }
  }

  on_dead() {
    this.lf2.sounds.play_preset('end')
  }

  handle_character_dead(): void {

  }
  override on_show(): void {
  }
}