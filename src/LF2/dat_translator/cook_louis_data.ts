import { IEntityData } from "../defines";
import { EntityVal } from "../defines/EntityVal";
import { CondMaker } from "./CondMaker";

export function cook_louis_data(cdata: IEntityData) {
  for (const k in cdata.frames) {
    const ja = cdata.frames[k].hit?.sequences?.['ja'];
    if (!ja || !('id' in ja) || ja.id !== '300') continue;
    ja.expression = new CondMaker().add(EntityVal.HP_P, '<=', 33)
      .or(EntityVal.LF2_NET_ON, '==', 1)
      .done()
  }
}
export function cook_rudolf_data(cdata: IEntityData) {
  for (const k in cdata.frames) {
    const opoints = cdata.frames[k].opoint;
    if (opoints) {
      for (const opoint of opoints) {
        if (opoint.oid === '5') {
          opoint.hp = 20;
          opoint.max_hp = 20;
        }
      }
    }
  }
}