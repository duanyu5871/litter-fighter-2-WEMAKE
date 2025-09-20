import { Expression } from "../base/Expression";
import type { IEntityData, IItrInfo } from "../defines";
import { HitFlag } from "../defines/HitFlag";
import type { LF2 } from "../LF2";
import { get_val_geter_from_collision } from "./get_val_from_collision";
import { preprocess_action } from "./preprocess_action";
import { preprocess_next_frame } from "./preprocess_next_frame";

/**
 * Description placeholder
 *
 * @export
 * @param {IItrInfo} itr 处理前的itr
 * @param {IEntityData} data 
 * @returns {IItrInfo} 处理后的itr
 */
export function preprocess_itr(lf2: LF2, itr: IItrInfo, data: IEntityData, jobs: Promise<void>[]): IItrInfo {
  const prefab = itr.prefab_id !== void 0 ? data.itr_prefabs?.[itr.prefab_id] : void 0;
  if (prefab) itr = { ...prefab, ...itr };
  if (itr.catchingact) preprocess_next_frame(itr.catchingact);
  if (itr.caughtact) preprocess_next_frame(itr.caughtact);
  if (itr.test)
    itr.tester = new Expression(itr.test, get_val_geter_from_collision);
  itr.hit_flag = itr.hit_flag ?? HitFlag.AllEnemy
  itr.actions?.forEach((n, i, l) => l[i] = preprocess_action(lf2, n, jobs));
  return itr;
}

preprocess_itr.TAG = "cook_frame";

