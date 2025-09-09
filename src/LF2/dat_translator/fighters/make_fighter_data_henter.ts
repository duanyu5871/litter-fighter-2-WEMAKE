import { EntityGroup, IEntityData } from "../../defines";
import { ensure } from "../../utils";
import { BotBuilder } from "./BotBuilder";

export function make_fighter_data_henter(data: IEntityData): IEntityData {
  data.base.group = ensure(data.base.group, EntityGroup._3000);
  BotBuilder.make(data).set_dataset({
    w_atk_m_x: 100,
    w_atk_b_x: 200,
    w_atk_f_x: 200
  });
  return data;
}
