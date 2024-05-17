import { is_num, not_zero_num } from '../utils/type_check';
import { IOpointInfo } from '../defines';
import { Defines } from '../defines/defines';
import { get_next_frame_by_raw_id } from './get_the_next';
import { take } from './take';

export default function cook_opoint(opoint: IOpointInfo) {
  const action = take(opoint, 'action');
  if (is_num(action)) opoint.action = get_next_frame_by_raw_id(action);

  const dvx = take(opoint, 'dvx');
  if (not_zero_num(dvx)) opoint.dvx = dvx * 0.5;

  const dvz = take(opoint, 'dvz');
  if (not_zero_num(dvz)) opoint.dvz = dvz * 0.5;

  const dvy = take(opoint, 'dvy');
  if (not_zero_num(dvy)) opoint.dvy = dvy * -0.5;

  const facing = take(opoint, 'facing');
  opoint.multi = 1;
  if (is_num(facing)) {
    opoint.facing = facing % 2 ?
      Defines.FacingFlag.Backward :
      Defines.FacingFlag.None;
    if (Math.abs(facing) >= 10) {
      opoint.multi = Math.floor(facing / 10);
    }
  } else {
    opoint.facing = Defines.FacingFlag.None;
    opoint.multi = 1;
  }
}

