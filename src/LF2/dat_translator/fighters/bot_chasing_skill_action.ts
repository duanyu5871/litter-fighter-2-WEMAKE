import { BotCtrlState } from "../../controller/BotCtrlState";
import { BotVal, Defines, EntityVal, GameKey as GK, GameKey } from "../../defines";
import { IBotAction } from "../../defines/IBotAction";
import { CondMaker } from "../CondMaker";

type Key1 = '^' | '>' | 'v' | 'j';
type Key2 = 'a' | 'j';
export function bot_chasing_skill_action(
  keys_str: `d${Key1}${Key2}`,
  action_id: string = keys_str,
  min_mp: number = -1,
  desire: number = 0.05
): IBotAction {
  const keys: IBotAction['keys'] = [GK.d];
  switch (keys_str[1]) {
    case '^': keys.push(GameKey.U); break;
    case 'v': keys.push(GameKey.D); break;
    case '>': keys.push('F'); break;
    case 'j': keys.push(GameKey.j); break;
  }
  switch (keys_str[2]) {
    case 'a': keys.push(GameKey.a); break;
    case 'j': keys.push(GameKey.j); break;
  }
  return {
    action_id: action_id,
    desire: Defines.calc_desire(desire),
    status: [BotCtrlState.Chasing],
    expression: min_mp > 0 ?
      new CondMaker<BotVal | EntityVal>()
        .add(EntityVal.MP, '>=', min_mp)
        .done() : void 0,
    keys: keys
  };
}


