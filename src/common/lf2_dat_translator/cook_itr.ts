import { IItrInfo } from '../lf2_type';
import { Defines } from '../lf2_type/defines';
import { is_positive, not_zero_num, is_num } from '../type_check';
import { get_next_frame_by_raw_id } from './get_the_next';
import { take } from './take';
export default function cook_itr(unsafe_itr?: Partial<IItrInfo>) {
  if (!unsafe_itr) return;

  const vrest = take(unsafe_itr, 'vrest');
  if (is_positive(vrest)) { unsafe_itr.vrest = Math.max(2, 2 * vrest - 2); }

  const arest = take(unsafe_itr, 'arest');
  if (is_positive(arest)) { unsafe_itr.arest = Math.max(2, 2 * arest - 2); }

  const dvx = take(unsafe_itr, 'dvx');
  if (not_zero_num(dvx)) unsafe_itr.dvx = dvx * 0.5;

  const dvz = take(unsafe_itr, 'dvz');
  if (not_zero_num(dvz)) unsafe_itr.dvz = dvz * 0.5;

  const dvy = take(unsafe_itr, 'dvy');
  if (not_zero_num(dvy)) unsafe_itr.dvy = dvy * -0.5; //??

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
