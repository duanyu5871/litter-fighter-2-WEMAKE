import { abs } from "../utils";
import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Base } from "./BotCtrlState_Base";
import { random_jumping } from "./random_jumping";

export class BotCtrlState_Avoiding extends BotCtrlState_Base {
  readonly key = BotCtrlState.Avoiding;
  override update() {

    const { ctrl: c } = this;
    c.update_nearest();
    const me = c.entity;
    const en = c.chasing
    const av = c.avoiding
    if (av && en && (abs(av.position.x - me.position.x) + (av.position.z - me.position.z)) > (abs(en.position.x - me.position.x) + (en.position.z - me.position.z)))
      return BotCtrlState.Chasing


    random_jumping(this.ctrl)
    if (this.ctrl.avoiding) {
      this.ctrl.avoid_enemy();
    } else if (this.ctrl.chasing) {
      return BotCtrlState.Chasing;
    } else  {
      return BotCtrlState.Standing;
    }
  }
}
