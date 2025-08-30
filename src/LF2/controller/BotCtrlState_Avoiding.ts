
import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Base } from "./BotCtrlState_Base";
import { random_jumping } from "./random_jumping";
import { manhattan_xz } from "../helper/manhattan_xz";
export class BotCtrlState_Avoiding extends BotCtrlState_Base {
  readonly key = BotCtrlState.Avoiding;
  override update() {

    const { ctrl: c } = this;
    c.update_nearest();
    const me = c.entity;
    const en = c.chasing
    const av = c.avoiding

    random_jumping(this.ctrl)

    if (av && en && manhattan_xz(me, av) > manhattan_xz(me, en))
      return BotCtrlState.Chasing
    else if (av) {
      this.ctrl.avoid_enemy();
    } else if (en) {
      return BotCtrlState.Chasing;
    } else {
      return BotCtrlState.Standing;
    }
  }
}
