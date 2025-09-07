import type { IState } from "../../base/FSM";
import { GK, LGK, StateEnum } from "../../defines";
import { random_get } from "../../utils";
import type { BotController } from "../BotController";
import type { BotStateEnum } from "../../defines/BotStateEnum";

export abstract class BotState_Base implements IState<BotStateEnum> {
  abstract key: BotStateEnum;
  readonly ctrl: BotController
  constructor(ctrl: BotController) {
    this.ctrl = ctrl;
  }
  defend_test(): boolean {
    const { ctrl: c } = this;
    const me = c.entity;
    const { facing } = me
    if (c.balls.targets.length <= 0)
      return false
    const dx = c.balls.targets[0].entity.position.x - me.position.x
    if (dx > 0 && facing < 0) {
      c.key_down(GK.R).key_up(GK.L)
    } else if (dx < 0 && facing > 0) {
      c.key_down(GK.L).key_up(GK.R)
    }
    c.start(GK.d).end(GK.d)
    return true;
  }
  random_jumping() {
    const c = this.ctrl;
    const { state } = c.entity.frame;
    const desire = c.desire()
    switch (state) {
      case StateEnum.Running: {
        (
          desire < c.dash_desire ?
            c.key_down :
            c.key_up
        ).call(c, GK.j)
        break;
      }
      case StateEnum.Standing:
      case StateEnum.Walking: {
        (
          desire < c.jump_desire ?
            c.key_down :
            c.key_up
        ).call(c, GK.j)
        break;
      }
      default:
        c.key_up(GK.j);
    }
  }
  update?(dt: number): BotStateEnum | undefined | void;
  enter?(): void;
  leave?(): void;
  handle_bot_actions(): boolean {
    const { ctrl: c } = this;
    const me = c.entity;
    const { bot } = me.data.base

    if (!bot) return false;
    const keys_list: LGK[][] = []
    let action_ids = bot.frames?.[me.frame.id]
    if (action_ids) for (const aid of action_ids) {
      const keys = this.ctrl.handle_action(bot.actions[aid])
      if (keys) keys_list.push(keys)
    }

    action_ids = bot.states?.[me.frame.state]
    if (action_ids) for (const aid of action_ids) {
      const keys = this.ctrl.handle_action(bot.actions[aid])
      if (keys) keys_list.push(keys)
    }

    if (!keys_list.length) return false

    const keys = random_get(keys_list)
    if (keys) this.ctrl.start(...keys).end(...keys)

    return true
  }
}
