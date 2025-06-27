import { Expression } from "../base/Expression";
import { IEntityData, IItrInfo } from "../defines";
import { AllyFlag } from "../defines/AllyFlag";
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
export function preprocess_itr(itr: IItrInfo, data: IEntityData): IItrInfo {
  const prefab = itr.prefab_id !== void 0 ? data.itr_prefabs?.[itr.prefab_id] : void 0;
  if (prefab) itr = { ...prefab, ...itr };
  if (itr.catchingact) preprocess_next_frame(itr.catchingact);
  if (itr.caughtact) preprocess_next_frame(itr.caughtact);
  if (itr.test)
    itr.tester = new Expression(
      itr.test,
      void 0,
      get_val_geter_from_collision
    );
  itr.ally_flags = itr.ally_flags ?? AllyFlag.Enemy
  itr.actions?.forEach(n => preprocess_action(n));
  return itr;
}

preprocess_itr.TAG = "cook_frame";

