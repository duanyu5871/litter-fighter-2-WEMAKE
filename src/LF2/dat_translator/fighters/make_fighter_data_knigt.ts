import { IEntityData, ArmorEnum, Defines } from "../../defines";
/**
 *
 * @todo
 * @export
 * @param {IEntityData} data
 * @return {IEntityData} 
 */
export function make_fighter_data_knigt(data: IEntityData): IEntityData {
  data.base.armor = {
    hit_sounds: ["data/085.wav.mp3"],
    type: ArmorEnum.Fall,
    toughness: Defines.DEFAULT_FALL_VALUE_CRITICAL,
  };
  return data;
}
