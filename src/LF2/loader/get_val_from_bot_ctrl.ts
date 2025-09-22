import { BotController } from "../bot/BotController";
import { ATTCKING_STATES } from "../defines";
import { BotVal } from "../defines/BotVal";
import { IValGetter, IValGetterGetter } from "../defines/IExpression";
import { abs } from "../utils";
import { get_val_getter_from_entity } from "./get_val_from_entity";
export const bot_val_getters: Record<BotVal, (e: BotController) => any> = {
  [BotVal.Desire]: e => e.desire(),
  [BotVal.BotState]: e => e.fsm.state?.key ?? '',
  [BotVal.EnemyY]: e => e.get_chasing()?.position.y,
  [BotVal.EnemyDiffY]: e => {
    const chasing = e.get_chasing();
    if (!chasing) return NaN;
    return chasing.position.y - e.entity.position.y;
  },
  [BotVal.EnemyX]: e => e.get_chasing()?.position.x,
  [BotVal.EnemyDiffX]: e => {
    const chasing = e.get_chasing();
    if (!chasing) return NaN;
    return e.entity.facing * (chasing.position.x - e.entity.position.x);
  },
  [BotVal.EnemyState]: e => e.get_chasing()?.frame.state,
  [BotVal.Safe]: e => {
    if (e.defends.entities.size) return 0;
    const chasing = e.get_chasing();
    const avoiding = e.get_avoiding();
    if (chasing && abs(chasing.position.x - e.entity.position.x) < 300 && abs(chasing.position.z - e.entity.position.z) < 200) return 0;
    if (chasing && ATTCKING_STATES.some(v => chasing.frame.state === v)) return 0;
    if (avoiding && abs(avoiding.position.x - e.entity.position.x) < 300 && abs(avoiding.position.z - e.entity.position.z) < 200) return 0;
    if (avoiding && ATTCKING_STATES.some(v => avoiding.frame.state === v)) return 0;
    return 0;
  }
}
export const bot_entity_val_getters = new Map<string, IValGetter<BotController>>();

export const get_val_from_bot_ctrl: IValGetterGetter<BotController> = (word) => {
  const val_getter = bot_val_getters[word as BotVal]
  if (val_getter) return val_getter;
  let fallback = bot_entity_val_getters.get(word);
  if (!fallback) {
    const val_getter = get_val_getter_from_entity(word);
    fallback = val_getter ? (e, ...arg) => val_getter(e.entity, ...arg) : () => word
    bot_entity_val_getters.set(word, fallback)
  }
  return fallback;
};
