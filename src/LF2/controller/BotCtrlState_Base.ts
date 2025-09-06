import { IState } from "../base/FSM";
import { TLooseGameKey } from "../defines";
import { random_get } from "../utils";
import { abs } from "../utils/math/base";
import { BotController } from "./BotController";
import { BotCtrlState } from "./BotCtrlState";

export abstract class BotCtrlState_Base implements IState<BotCtrlState> {
  abstract key: BotCtrlState;
  readonly ctrl: BotController
  constructor(ctrl: BotController) {
    this.ctrl = ctrl;
  }
  update?(dt: number): BotCtrlState | undefined | void;
  enter?(): void;
  leave?(): void;
  handle_bot_actions(): boolean {
    const { ctrl: c } = this;
    const me = c.entity;
    const { bot } = me.data.base

    if (!bot) return false;

    const keys_list: TLooseGameKey[][] = []

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
