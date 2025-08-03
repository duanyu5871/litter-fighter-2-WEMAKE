import { KEY_NAME_LIST } from "./BaseController";
import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Base } from "./BotCtrlState_Base";

export class BotCtrlState_Standing extends BotCtrlState_Base {
  readonly key = BotCtrlState.Standing;
  override enter(): void {
    this.ctrl.key_up(...KEY_NAME_LIST)
  }
  override update() {
    this.ctrl.update_nearest()
    if (this.ctrl.chasing_enemy) {
      return BotCtrlState.Chasing;
    } else if (this.ctrl.avoiding_enemy) {
      return BotCtrlState.Avoiding;
    }
  }
}

