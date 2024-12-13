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
  i.judger = new Expression(i.expression, get_val_from_entity);
}

function get_val_from_entity(word: string, e: Entity): any {
  switch (word) {
    case Defines.ValWord.TrendX:
      if (is_entity(e)) {
        if (e.velocities[0].x < 0) return -e.facing;
        if (e.velocities[0].x > 0) return e.facing;
      }
      return 0
    case Defines.ValWord.PressFB:
      return e.controller ? e.controller.LR * e.facing : 0;
    case Defines.ValWord.PressLR:
      return e.controller ? e.controller.LR : 0;
    case Defines.ValWord.PressUD:
      return e.controller ? e.controller.UD : 0;
    case Defines.ValWord.HP_P:
      return clamp(Math.round(100 * e.hp / e.max_hp), 0, 100);
    case Defines.ValWord.LF2_NET_ON:
      return e.lf2.is_cheat_enabled(Defines.Cheats.LF2_NET) ? 1 : 0;
    case Defines.ValWord.HERO_FT_ON:
      return e.lf2.is_cheat_enabled(Defines.Cheats.HERO_FT) ? 1 : 0;
    case Defines.ValWord.GIM_INK_ON:
      return e.lf2.is_cheat_enabled(Defines.Cheats.GIM_INK) ? 1 : 0;
    case Defines.ValWord.WeaponType:
      return is_entity(e) && is_weapon(e.holding) ? e.holding?.data.base.type || 0 : 0;
    case Defines.ValWord.HAS_TRANSFROM_DATA:
      return e.transform_datas ? 1 : 0;
    case Defines.ValWord.Catching:
      return e.catching ? 1 : 0;
    case Defines.ValWord.CAUGHT:
      return e.catcher ? 1 : 0;
  }
  return word
}


