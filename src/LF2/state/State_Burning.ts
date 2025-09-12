import { StateEnum } from "../defines";
import { Entity } from "../entity";
import { BallState_Burning } from "./BallState_Burning";
import CharacterState_Burning from "./CharacterState_Burning";
import { make_smoke } from "./make_smoke";
import { StateBase_Proxy } from "./StateBase_Proxy";

export class State_Burning extends StateBase_Proxy {
  override state: string | number = StateEnum.Burning;
  constructor() {
    super(new CharacterState_Burning(), void 0, new BallState_Burning(), void 0);
  }
  override update(e: Entity): void {
    this.proxy.update(e);
  }
}
