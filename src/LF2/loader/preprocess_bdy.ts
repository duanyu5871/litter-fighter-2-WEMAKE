import { Expression } from "../base/Expression";
import { IBdyInfo, IEntityData } from "../defines";
import { AllyFlag } from "../defines/AllyFlag";
import { get_val_geter_from_collision } from "./get_val_from_collision";
import { preprocess_action } from "./preprocess_action";

export function preprocess_bdy(bdy: IBdyInfo, data: IEntityData) {
  const prefab = bdy.prefab_id ? data.bdy_prefabs?.[bdy.prefab_id] : void 0;
  if (prefab) bdy = { ...prefab, ...bdy };
  bdy.ally_flags = bdy.ally_flags ?? AllyFlag.Enemy
  if (bdy.test)
    bdy.tester = new Expression(
      bdy.test,
      void 0,
      get_val_geter_from_collision
    );

  bdy.actions?.forEach(n => preprocess_action(n));
  return bdy;
}

preprocess_bdy.TAG = 'preprocess_bdy'