import type Entity from "../../entity/Entity";
import { BaseState } from "../base";


export class TransformToLouisEX extends BaseState {
  override enter(e: Entity): void {
    const d = e.lf2.datas.find_character('50')
    if (d) {
      e.data = d;
      e.enter_frame(e.find_auto_frame());
    }
  }
}
