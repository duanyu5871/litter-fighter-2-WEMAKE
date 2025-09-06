import { EntityGroup, IEntityData } from "../../defines";
import { add_entity_groups } from "../add_entity_to_group";
import { BotBuilder } from "./BotBuilder";

export function make_fighter_data_henter(data: IEntityData): IEntityData {
  add_entity_groups(data.base, EntityGroup._3000);
  BotBuilder.make(data).set_dataset({
    w_atk_m_x: 100,
    w_atk_b_x: 200,
    w_atk_f_x: 200
  });
  return data;
}
