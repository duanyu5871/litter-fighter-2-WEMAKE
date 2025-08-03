import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Base } from "./BotCtrlState_Base";

export class BotCtrlState_Avoiding extends BotCtrlState_Base {
  readonly key = BotCtrlState.Avoiding;
  override update() {
    this.ctrl.update_nearest();
    if (this.ctrl.chasing_enemy) {
      return BotCtrlState.Chasing;
    } else if (this.ctrl.avoiding_enemy) {
      this.ctrl.avoid_enemy();
    } else {
      return BotCtrlState.Standing;
    }
  }
}
