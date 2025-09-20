
import { GK, ItrKind, StateEnum } from "../../defines";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { find } from "../../utils";
import { BotState_Base } from "./BotState";
import { BotStateEnum } from "../../defines/BotStateEnum";
export class BotState_Avoiding extends BotState_Base {
  readonly key = BotStateEnum.Avoiding;
  override update() {

    const { ctrl: c } = this;
    const me = c.entity;
    const en = c.get_chasing()
    const av = c.get_avoiding()
    const { state } = me.frame;

    if (c.defends.targets.length > 0) {
      if (c.defends.targets[0].defendable === 1) {
        const dx = c.defends.targets[0].entity.position.x - me.position.x
        const t_facing = c.defends.targets[0].entity.facing
        if (dx > 0 && t_facing < 0) {
          c.key_down(GK.R).key_up(GK.L)
        } else if (dx < 0 && t_facing > 0) {
          c.key_down(GK.L).key_up(GK.R)
        }
        c.start(GK.d).end(GK.d)
      } else {
        // 不可防御的攻击
      }
      return
    }

    this.random_jumping()
    if (this.handle_bot_actions()) return;
    if (av && en && manhattan_xz(me, av) > manhattan_xz(me, en))
      return BotStateEnum.Chasing
    else if (av) {
      this.ctrl.avoid_enemy();
    } else if (en) {
      return BotStateEnum.Chasing;
    } else {
      return BotStateEnum.Idle;
    }
    switch (state) {
      case StateEnum.Normal:
      case StateEnum.Standing:
      case StateEnum.Walking:
      case StateEnum.Running:
        if (this.defend_test()) return;
    }
    switch (state) {
      case StateEnum.Dash:
      case StateEnum.Jump:
      case StateEnum.Standing:
      case StateEnum.Walking:
      case StateEnum.Running: {
        if (find(me.v_rests, v => v[1].itr.kind === ItrKind.Block)) {
          c.start(GK.a).end(GK.a)
        }
        break;
      }
    }
  }
}
