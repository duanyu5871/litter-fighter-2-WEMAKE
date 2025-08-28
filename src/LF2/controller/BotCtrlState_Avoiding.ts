
import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Base } from "./BotCtrlState_Base";
import { random_jumping } from "./random_jumping";
import { xz_distance } from "./xz_distance";
export class BotCtrlState_Avoiding extends BotCtrlState_Base {
  readonly key = BotCtrlState.Avoiding;
  override update() {

    const { ctrl: c } = this;
    c.update_nearest();
    const me = c.entity;
    const en = c.chasing
    const av = c.avoiding

    random_jumping(this.ctrl)

    if (av && en && xz_distance(me, av) > xz_distance(me, en))
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
