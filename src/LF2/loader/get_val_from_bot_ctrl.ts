import { BotController } from "../controller/BotController";
import { BotVal } from "../defines/BotVal";
import { IValGetter, IValGetterGetter } from "../defines/IExpression";
import { get_val_getter_from_entity } from "./get_val_from_entity";

export const get_val_from_bot_ctrl: IValGetterGetter<BotController> = (
  word: string
): IValGetter<BotController> | undefined => {
  switch (word as BotVal) {
    case BotVal.Desire: return e => e.desire()
    case BotVal.BotState: return e => (e.fsm.state?.key ?? '')
    case BotVal.EnemyY: return e => e.chasing?.position.y
    case BotVal.EnemyDiffY: return e => e.chasing ? (e.chasing.position.y - e.entity.position.y) : NaN
    case BotVal.EnemyX: return e => e.chasing?.position.x
    case BotVal.EnemyDiffX: return e => e.chasing ? e.entity.facing * (e.chasing.position.x - e.entity.position.x) : NaN
    default: {
      const fallback = get_val_getter_from_entity(word);
      return (e, ...arg) => fallback?.(e.entity, ...arg);
    }
  }
};
