import { BuiltIn_OID, Defines } from "../defines";
import { IEntityData } from "../defines/IEntityData";
import { add_entity_groups } from "./add_entity_to_group";
import { make_louis_data, make_rudolf_data } from "./cook_louis_data";

export function make_character_special(data: IEntityData) {
  const num_id = Number(data.id);
  if ((num_id >= 30 && num_id <= 39) || (num_id >= 50 && num_id <= 59)) {
    add_entity_groups(data.base, Defines.EntityGroup.Hidden);
  }
  if (num_id >= 1 && num_id <= 29) {
    add_entity_groups(data.base, Defines.EntityGroup.Regular);
  }
  switch (data.id) {
    case BuiltIn_OID.Julian:
      data.base.ce = 3;
      data.base.armor = {
        fireproof: 1,
        antifreeze: 1,
        hit_sounds: ["data/002.wav.mp3"],
        type: "times",
        toughness: 3,
      };
      break;
    case BuiltIn_OID.Firzen:
      data.base.ce = 2;
      break;
    case BuiltIn_OID.Knight:
      data.base.armor = {
        hit_sounds: ["data/085.wav.mp3"],
        type: "times",
        toughness: 3,
      };
      break;
    case BuiltIn_OID.Louis:
      data.base.armor = {
        hit_sounds: ["data/085.wav.mp3"],
        type: "times",
        toughness: 1,
      };
      make_louis_data(data)
      break;
    case BuiltIn_OID.Bandit:
    case BuiltIn_OID.Hunter:
      add_entity_groups(data.base, Defines.EntityGroup._3000);
      break;
    case BuiltIn_OID.Rudolf:
      make_rudolf_data(data);
      break;
  }
}