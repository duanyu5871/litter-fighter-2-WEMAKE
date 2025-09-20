import { BuiltIn_OID, IEntityData } from "../../defines";
import { BotBuilder } from "./BotBuilder";

/**
 *
 * @todo
 * @export
 * @param {IEntityData} data
 * @return {IEntityData}
 */
export function make_fighter_data_rudolf(data: IEntityData): IEntityData {
  for (const k in data.frames) {
    data.frames[k].opoint?.forEach((opoint) => {
      if (opoint.oid === BuiltIn_OID.Rudolf) {
        opoint.hp = opoint.max_hp = 20;
        opoint.mp = opoint.max_mp = 150;
      }
    });
  }
  BotBuilder.make(data).set_dataset({
    w_atk_b_x: 200,
    w_atk_f_x: 200
  })
  return data;
}
