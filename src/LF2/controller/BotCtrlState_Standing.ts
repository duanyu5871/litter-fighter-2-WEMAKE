import { KEY_NAME_LIST } from "./BaseController";
import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Base } from "./BotCtrlState_Base";
import { xz_distance } from "./xz_distance";

export class BotCtrlState_Standing extends BotCtrlState_Base {
  readonly key = BotCtrlState.Standing;
  override enter(): void {
    this.ctrl.key_up(...KEY_NAME_LIST)
  }
  override update() {
    const { ctrl: c } = this;
    c.update_nearest()
    const me = c.entity;
    const en = c.chasing
    const av = c.avoiding
    if (!en && !av)
      return BotCtrlState.Standing
    else if (!en)
      return BotCtrlState.Avoiding;
    else if (!av)
      return BotCtrlState.Chasing;
    else if (xz_distance(me, av) < xz_distance(me, en))
      return BotCtrlState.Avoiding;
    else
      return BotCtrlState.Chasing;
  }
}

