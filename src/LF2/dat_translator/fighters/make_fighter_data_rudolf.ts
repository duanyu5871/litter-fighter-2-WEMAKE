import { IEntityData } from "../../defines";

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
      if (opoint.oid === "5") 
        opoint.hp = opoint.max_hp = 20;
    });
  }
  return data;
}
