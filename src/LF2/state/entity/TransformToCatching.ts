import { Defines } from "../../defines";
import type Entity from "../../entity/Entity";
import { BaseState } from "../base";


export class TransformToCatching extends BaseState {
  override readonly state = Defines.State.TransformToCatching_End;
  override update(e: Entity): void {
    e.transfrom_to_another();
    e.enter_frame(e.find_auto_frame());
  }
}
