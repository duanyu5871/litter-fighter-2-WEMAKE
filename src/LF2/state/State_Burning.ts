
import { StateEnum } from "../defines";
import { BallState_Burning } from "./BallState_Burning";
import CharacterState_Burning from "./CharacterState_Burning";
import { StateBase_Proxy } from "./StateBase_Proxy";

export class State_Burning extends StateBase_Proxy {
  override state: string | number = StateEnum.Burning;
  constructor() {
    super(new CharacterState_Burning(), void 0, new BallState_Burning(), void 0);
  }
}
