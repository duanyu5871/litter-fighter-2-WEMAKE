import type { IFrameInfo } from "../../defines";
import { Defines } from "../../defines/defines";
import LocalController from "../../controller/LocalController";
import type Character from '../../entity/Character';
import BaseCharacterState from "./Base";

export default class Lying extends BaseCharacterState {

  override enter(e: Character, prev_frame: IFrameInfo): void {
    if (e.get_frame().state === Defines.State.Lying && e.hp <= 0) {
      e.on_lying_and_dead()
      if (
        !e.controller?.player_id ||
        !e.lf2.world.player_slot_characters.has(e.controller?.player_id)
      )
        e.blink_and_gone(120);
    }
  }
  override leave(e: Character, next_frame: IFrameInfo): void {
    if (LocalController.is(e.controller) || e.world.stage.data.id === Defines.VOID_STAGE.id)
      e.blink(120);
  }
}
