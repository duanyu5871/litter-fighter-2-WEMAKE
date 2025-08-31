import { IEntityData, StateEnum } from "../../defines";
import { IBotAction } from "../../defines/IBotAction";

export class BotBuilder {
  readonly data: IEntityData;

  static make(data: IEntityData) {
    return new BotBuilder(data);
  }
  constructor(data: IEntityData) {
    this.data = data;
  }
  actions(...actions: IBotAction[]): this {
    const bot = this.data.base.bot || { actions: {} };
    for (const action of actions)
      bot.actions[action.action_id] = action;
    this.data.base.bot = bot;
    return this;
  }
  frames(frame_ids: string[], action_ids: string[]): this {
    const bot = this.data.base.bot || { actions: {} };
    const frames = bot.frames || {};
    frames['' + frame_ids] = action_ids;
    bot.frames = frames;
    this.data.base.bot = bot;
    return this;
  }
  states(state_ids: (string | number | StateEnum)[], action_ids: string[]) {
    const bot = this.data.base.bot || { actions: {} };
    const states = bot.states || {};
    states['' + state_ids] = action_ids;
    bot.states = states;
    this.data.base.bot = bot;
    return this;
  }
}
