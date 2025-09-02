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
    const opoints = data.frames[k].opoint;
    if (opoints) {
      for (const opoint of opoints) {
        if (opoint.oid === "5") {
          opoint.hp = 20;
          opoint.max_hp = 20;
        }
      }
    }
  }
  return data;
}
