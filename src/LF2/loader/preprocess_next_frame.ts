import FrameAnimater from '../entity/FrameAnimater';
import Expression from '../base/Expression';
import { INextFrame } from "../defines";
import { Defines } from '../defines/defines';
import { is_character, is_entity } from "../entity/type_check";

export function cook_next_frame(i: INextFrame | INextFrame[]): void {
  if (Array.isArray(i)) {
    for (const v of i) cook_next_frame(v);
    return;
  }
  if (typeof i.expression !== 'string') return;
  const expression = (i as any).condition_cls = new Expression(i.expression, get_val);
  i.expression = expression.make();
}

function get_val(word: string): (e: FrameAnimater) => any {
  switch (word) {
    case Defines.ValWord.TrendX:
      return e => {
        if (is_entity(e)) {
          if (e.velocity.x < 0) return -e.facing;
          if (e.velocity.x > 0) return e.facing;
        }
        return 0
      }
    case Defines.ValWord.PressFB:
      return e => is_character(e) ? e.controller.LR * e.facing : 0;
    case Defines.ValWord.PressUD:
      return e => is_character(e) ? e.controller.UD : 0;
    case Defines.ValWord.WeaponType:
      return e => is_entity(e) ? e.weapon?.data.base.type || 0 : 0;
  }
  return () => word
}


