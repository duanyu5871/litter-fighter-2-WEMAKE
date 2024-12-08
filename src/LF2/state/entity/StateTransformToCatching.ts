import type Entity from "../../entity/Entity";
import { BaseState } from "../base";


export class StateTransformToCatching extends BaseState {
  update(e: Entity): void {
    e.transfrom_to_another();
    e.enter_frame(e.find_auto_frame());
  }
}
