import type { Entity } from "../entity/Entity";
import State_Base from "./State_Base";

export class CharacterState_TransformToLouisEX extends State_Base {
  override enter(e: Entity): void {
    const d = e.lf2.datas.find_character("50");
    if (d) {
      e.data = d;
      e.enter_frame(e.find_auto_frame());
    }
  }
}
