import { INextFrame } from "../../common/lf2_type";
import { Defines } from '../../common/lf2_type/defines';
import { FrameAnimater } from '../FrameAnimater';
import Expression from '../base/Expression';
import Character from '../entity/Character';
import Entity from '../entity/Entity';

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
        if (Entity.is(e)) {
          if (e.velocity.x < 0) return -e.facing;
          if (e.velocity.x > 0) return e.facing;
        }
        return 0
      }
    case Defines.ValWord.PressFB:
      return e => Character.is(e) ? e.controller.LR * e.facing : 0;
    case Defines.ValWord.PressUD:
      return e => Character.is(e) ? e.controller.UD : 0;
    case Defines.ValWord.WeaponType:
      return e => Entity.is(e) ? e.weapon?.data.base.type || 0 : 0;
  }
  return () => word
}


