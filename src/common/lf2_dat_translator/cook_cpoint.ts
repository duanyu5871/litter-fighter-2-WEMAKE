import { ICpointInfo } from '../lf2_type';
import { Defines } from '../lf2_type/defines';
import { is_num, not_zero_num } from '../type_check/is_num';
import { is_str } from '../type_check/is_str';
import { get_next_frame_by_raw_id } from './get_the_next';
import { take } from './take';

export function cook_cpoint(unsure_cpoint: ICpointInfo) {
  const tvx = take(unsure_cpoint, 'throwvx');
  if (not_zero_num(tvx) && tvx !== -842150451) unsure_cpoint.throwvx = tvx * 0.5;

  const tvy = take(unsure_cpoint, 'throwvy');
  if (not_zero_num(tvy) && tvy !== -842150451) unsure_cpoint.throwvy = tvy * -0.5;

  const tvz = take(unsure_cpoint, 'throwvz');
  if (not_zero_num(tvz) && tvz !== -842150451) unsure_cpoint.throwvy = tvz;

  const tvj = take(unsure_cpoint, 'throwinjury');
  if (not_zero_num(tvj) && tvj !== -842150451) unsure_cpoint.throwinjury = tvj;

  const vaction = take(unsure_cpoint as any, 'vaction');

  if (is_str(vaction) || is_num(vaction)) {
    unsure_cpoint.vaction = {
      ...get_next_frame_by_raw_id(vaction),
      facing: Defines.FacingFlag.SameAsCatcher
    };
  }
}
