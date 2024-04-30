import { is_num } from '../is_num';
import { IOpointInfo } from '../lf2_type';
import { Defines } from '../lf2_type/defines';
import { not_zero } from '../not_zero';
import { get_next_frame_by_id } from './get_the_next';
import { take } from './take';

export default function cook_opoint(opoint: IOpointInfo) {
  const action = take(opoint, 'action');
  if (is_num(action)) opoint.action = get_next_frame_by_id(action);

  const dvx = take(opoint, 'dvx');
  if (not_zero(dvx)) opoint.dvx = dvx * 0.5;

  const dvz = take(opoint, 'dvz');
  if (not_zero(dvz)) opoint.dvz = dvz * 0.5;

  const dvy = take(opoint, 'dvy');
  if (not_zero(dvy)) opoint.dvy = dvy * -0.5;

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

