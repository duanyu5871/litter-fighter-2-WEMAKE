import type { IFrameInfo } from "../../../common/lf2_type";
import { Defines } from "../../../common/lf2_type/defines";
import { LocalHuman } from "../../controller/LocalHuman";
import type Character from '../../entity/Character';
import BaseCharacterState from "./Base";

export default class Lying extends BaseCharacterState {
  override enter(e: Character, prev_frame: IFrameInfo): void {
    if (e.get_frame().state === Defines.State.Lying && e.hp <= 0) {
      e.on_lying_and_dead()
    }
  }
  override leave(e: Character, next_frame: IFrameInfo): void {
    if (LocalHuman.is(e.controller) || e.world.stage.data.id === Defines.THE_VOID_STAGE.id)
      e.blink(120);
  }
  begin(e: Character) {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
}
