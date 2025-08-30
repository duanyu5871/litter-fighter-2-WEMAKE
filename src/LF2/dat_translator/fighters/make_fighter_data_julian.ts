import { IEntityData, EntityGroup, ArmorEnum, Defines } from "../../defines";
import { add_entity_groups } from "../add_entity_to_group";

export function make_fighter_data_julian(data: IEntityData) {
  add_entity_groups(data.base, EntityGroup.Boss);
  data.base.ce = 3;
  data.base.armor = {
    fireproof: 1,
    antifreeze: 1,
    hit_sounds: ["data/002.wav.mp3"],
    type: ArmorEnum.Fall,
    toughness: Defines.DEFAULT_FALL_VALUE_MAX - Defines.DEFAULT_FALL_VALUE_DIZZY,
  };
  return data;
}
