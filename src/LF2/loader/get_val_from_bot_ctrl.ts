import { BotController } from "../controller/BotController";
import { BotCtrlVal } from "../defines/BotCtrlVal";
import { IValGetter, IValGetterGetter } from "../defines/IExpression";
import { get_val_getter_from_entity } from "./get_val_from_entity";

export const get_val_from_bot_ctrl: IValGetterGetter<BotController> = (
  word: string
): IValGetter<BotController> | undefined => {
  switch (word as BotCtrlVal) {
    case BotCtrlVal.Desire:
      return e => e.desire()
    case BotCtrlVal.BotState:
      return e => (e.fsm.state?.key ?? '')
    default: {
      const fallback = get_val_getter_from_entity(word);
      return (e, ...arg) => fallback?.(e.entity, ...arg);
    }
  }
};
