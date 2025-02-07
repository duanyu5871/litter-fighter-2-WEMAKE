import { FacingFlag, ICpointInfo } from "../defines";
import { Defines } from "../defines/defines";
import { is_num, is_str, not_zero_num } from "../utils/type_check";
import { get_next_frame_by_raw_id } from "./get_the_next";
import { take } from "./take";

export function cook_cpoint(unsure_cpoint: ICpointInfo): void {
  const tvx = take(unsure_cpoint, "throwvx");
  if (not_zero_num(tvx) && tvx !== -842150451)
    unsure_cpoint.throwvx = tvx * 0.5;

  const tvy = take(unsure_cpoint, "throwvy");
  if (not_zero_num(tvy) && tvy !== -842150451)
    unsure_cpoint.throwvy = tvy * -0.5;

  const tvz = take(unsure_cpoint, "throwvz");
  if (not_zero_num(tvz) && tvz !== -842150451) unsure_cpoint.throwvz = tvz;

  const tvj = take(unsure_cpoint, "throwinjury");
  if (not_zero_num(tvj) && tvj !== -842150451) {
    unsure_cpoint.throwinjury = tvj;
    unsure_cpoint.tx = 60;
    unsure_cpoint.ty = 15;
  }

  const vaction = take(unsure_cpoint as any, "vaction");
  const raw_injury = take(unsure_cpoint, "injury");
  if (is_num(raw_injury)) {
    unsure_cpoint.injury = Math.abs(raw_injury);
    if (raw_injury > 0) unsure_cpoint.shaking = Defines.DEFAULT_ITR_SHAKING;
  }

  if (is_str(vaction) || is_num(vaction)) {
    unsure_cpoint.vaction = {
      ...get_next_frame_by_raw_id(vaction),
      facing: FacingFlag.SameAsCatcher,
    };
  }
}
