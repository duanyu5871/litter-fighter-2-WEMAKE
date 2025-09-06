import { IEntityData } from "../../defines";
import { BotBuilder } from "./BotBuilder";

/**
 *
 * @todo
 * @export
 * @param {IEntityData} data
 * @return {IEntityData}
 */
export function make_fighter_data_henry(data: IEntityData): IEntityData {
  BotBuilder.make(data).set_dataset({
    w_atk_m_x: 100,
    w_atk_b_x: 350,
    w_atk_f_x: 350
  })
  return data;
}

