import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Base } from "./BotCtrlState_Base";
import { random_jumping } from "./random_jumping";

export class BotCtrlState_Avoiding extends BotCtrlState_Base {
  readonly key = BotCtrlState.Avoiding;
  override update() {
    this.ctrl.update_nearest();
    random_jumping(this.ctrl)
    if (this.ctrl.avoiding_enemy) {
      this.ctrl.avoid_enemy();
    } else if (this.ctrl.enemy) {
      return BotCtrlState.Chasing;
    } else  {
      return BotCtrlState.Standing;
    }
  }
}
