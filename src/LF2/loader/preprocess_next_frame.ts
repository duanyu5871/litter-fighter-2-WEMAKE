import Expression from '../base/Expression';
import { INextFrame } from "../defines";
import { Defines } from '../defines/defines';
import Entity from '../entity/Entity';
import { is_entity, is_weapon } from "../entity/type_check";
import { clamp } from '../utils/math';

export function cook_next_frame(i: INextFrame | INextFrame[]): void {
  if (Array.isArray(i)) {
    for (const v of i) cook_next_frame(v);
    return;
  }
  if (typeof i.expression !== 'string') return;
  const expression = (i as any).condition_cls = new Expression(i.expression, get_val_from_entity);
  i.expression = expression.run;
}

function get_val_from_entity(word: string, e: Entity): any {
  switch (word) {
    case Defines.ValWord.TrendX:
      if (is_entity(e)) {
        if (e.velocity.x < 0) return -e.facing;
        if (e.velocity.x > 0) return e.facing;
      }
      return 0
    case Defines.ValWord.PressFB:
      return e.controller ? e.controller.LR * e.facing : 0;
    case Defines.ValWord.PressUD:
      return e.controller ? e.controller.UD : 0;
    case Defines.ValWord.HP_P:
      return clamp(Math.round(100 * e.hp / e.max_hp), 0, 100);
    case Defines.ValWord.WeaponType:
      return is_entity(e) && is_weapon(e.holding) ? e.holding?.data.base.type || 0 : 0;
  }
  return word
}


