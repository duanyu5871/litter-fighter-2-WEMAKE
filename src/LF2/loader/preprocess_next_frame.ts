import { INextFrame } from "../../common/lf2_type";
import { Defines } from '../../common/lf2_type/defines';
import { FrameAnimater } from '../FrameAnimater';
import { Character } from '../entity/Character';
import { Entity } from '../entity/Entity';
import { Condition } from '../base/Condition';

export const preprocess_next_frame = (i: INextFrame | INextFrame[]) => {
  if (Array.isArray(i)) {
    for (const v of i) preprocess_next_frame(v);
    return;
  }
  if (typeof i.condition !== 'string') return;
  const condition = (i as any).condition_cls = new Condition(i.condition, get_val);
  i.condition = condition.make()
};

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


