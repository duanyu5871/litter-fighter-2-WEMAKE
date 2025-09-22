import { KEY_NAME_LIST } from "../../controller/BaseController";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { BotState_Base } from "./BotState";
import { manhattan_xz } from "../../helper/manhattan_xz";

export class BotState_Idle extends BotState_Base {
  readonly key = BotStateEnum.Idle;
  override enter(): void {
    this.ctrl.key_up(...KEY_NAME_LIST)
  }
  override update() {
    if (this.handle_defends()) return;
    if (this.handle_bot_actions()) return;
    this.random_jumping()

    const { ctrl: c } = this;
    const me = c.entity;
    const en = c.get_chasing()?.entity
    const av = c.get_avoiding()?.entity

    if (!en && !av)
      return BotStateEnum.Idle
    else if (!en)
      return BotStateEnum.Avoiding;
    else if (!av)
      return BotStateEnum.Chasing;
    else if (manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotStateEnum.Avoiding;
    else
      return BotStateEnum.Chasing;
  }
}

