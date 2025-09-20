import { StateEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import State_Base from "./State_Base";
export class CharacterState_TransformToLouisEX extends State_Base {
  constructor(state: StateEnum = StateEnum.TurnIntoLouisEX) {
    super(state)
  }
  override enter(e: Entity): void {
    const d = e.lf2.datas.find_character("50");
    if (d) {
      e.data = d;
      e.armor = void 0;
      e.toughness =
        e.toughness_max =
        e.toughness_resting =
        e.toughness_resting_max = 0;
      e.enter_frame(e.find_auto_frame());
    }
  }
}
