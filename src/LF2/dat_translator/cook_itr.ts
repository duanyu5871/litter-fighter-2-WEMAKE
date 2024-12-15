import { IItrInfo } from '../defines';
import { Defines } from '../defines/defines';
import { is_num, is_positive, not_zero_num } from '../utils/type_check';
import { get_next_frame_by_raw_id } from './get_the_next';
import { take } from './take';
export default function cook_itr(unsafe_itr?: Partial<IItrInfo>) {
  if (!unsafe_itr) return;

  const vrest = take(unsafe_itr, 'vrest');
  if (is_positive(vrest)) { unsafe_itr.vrest = Math.max(2, 2 * vrest - Defines.DEFAULT_ITR_SHAKEING); }

  const arest = take(unsafe_itr, 'arest');
  if (is_positive(arest)) { unsafe_itr.arest = Math.max(2, 2 * arest - Defines.DEFAULT_ITR_MOTIONLESS); }

  const src_dvx = take(unsafe_itr, 'dvx');
  if (not_zero_num(src_dvx)) unsafe_itr.dvx = src_dvx * 0.5;

  const src_dvz = take(unsafe_itr, 'dvz');
  if (not_zero_num(src_dvz)) unsafe_itr.dvz = src_dvz * 0.5;

  const src_dvy = take(unsafe_itr, 'dvy');
  if (not_zero_num(src_dvy)) unsafe_itr.dvy = src_dvy * -0.52;

  
  const fall = take(unsafe_itr, 'fall');
  if (not_zero_num(fall)) unsafe_itr.fall = fall * 2;

  const bdefend = take(unsafe_itr, 'bdefend');
  if (not_zero_num(bdefend)) unsafe_itr.bdefend = bdefend * 2;

  switch (unsafe_itr.effect) {
    case Defines.ItrEffect.FireExplosion:
    case Defines.ItrEffect.Explosion: {
      unsafe_itr.motionless = 0;
      break;
    }
  }
  switch (unsafe_itr.kind) {
    case Defines.ItrKind.Pick:
    case Defines.ItrKind.PickSecretly:
    case Defines.ItrKind.SuperPunchMe: {
      unsafe_itr.motionless = 0;
      unsafe_itr.shaking = 0;
      if (is_positive(vrest)) unsafe_itr.vrest = vrest + 2;
      break;
    }
    case Defines.ItrKind.ForceCatch:
    case Defines.ItrKind.Catch: {
      unsafe_itr.motionless = 0;
      unsafe_itr.shaking = 0;
      if (unsafe_itr.vrest) {
        unsafe_itr.arest = unsafe_itr.vrest;
        delete unsafe_itr.vrest;
      }
      break;
    }
    case Defines.ItrKind.JohnShield:
      unsafe_itr.friendly_fire = 1;
      break;
    case Defines.ItrKind.Heal: {
      if (src_dvx) unsafe_itr.hit_act = get_next_frame_by_raw_id(src_dvx)
      unsafe_itr.friendly_fire = 1 // 允许治疗队友
      break;
    }
  }

  const catchingact = take(unsafe_itr, 'catchingact');
  if (is_num(catchingact)) unsafe_itr.catchingact = get_next_frame_by_raw_id(catchingact);

  const caughtact = take(unsafe_itr, 'caughtact');
  if (is_num(caughtact)) unsafe_itr.caughtact = {
    ...get_next_frame_by_raw_id(caughtact),
    facing: Defines.FacingFlag.OpposingCatcher,
  };
}
