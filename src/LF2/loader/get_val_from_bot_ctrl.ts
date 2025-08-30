import { BotController } from "../controller/BotController";
import { BotVal } from "../defines/BotVal";
import { IValGetter, IValGetterGetter } from "../defines/IExpression";
import { get_val_getter_from_entity } from "./get_val_from_entity";

export const get_val_from_bot_ctrl: IValGetterGetter<BotController> = (
  word: string
): IValGetter<BotController> | undefined => {
  switch (word as BotVal) {
    case BotVal.Desire:
      return e => e.desire()
    case BotVal.BotState:
      return e => (e.fsm.state?.key ?? '')
    default: {
      const fallback = get_val_getter_from_entity(word);
      return (e, ...arg) => fallback?.(e.entity, ...arg);
    }
  }
};
