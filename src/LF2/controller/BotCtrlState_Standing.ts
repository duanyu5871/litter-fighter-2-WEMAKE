import { KEY_NAME_LIST } from "./BaseController";
import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Base } from "./BotCtrlState_Base";
import { manhattan_xz } from "../helper/manhattan_xz";

export class BotCtrlState_Standing extends BotCtrlState_Base {
  readonly key = BotCtrlState.Standing;
  override enter(): void {
    this.ctrl.key_up(...KEY_NAME_LIST)
  }
  override update() {
    const { ctrl: c } = this;
    const me = c.entity;
    const en = c.get_chasing()
    const av = c.get_avoiding()
    if (!en && !av)
      return BotCtrlState.Standing
    else if (!en)
      return BotCtrlState.Avoiding;
    else if (!av)
      return BotCtrlState.Chasing;
    else if (manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotCtrlState.Avoiding;
    else
      return BotCtrlState.Chasing;
  }
}

