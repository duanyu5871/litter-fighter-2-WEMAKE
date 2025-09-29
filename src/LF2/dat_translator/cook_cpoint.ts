import { IFrameInfo } from "../defines";
import { FacingFlag } from "../defines/FacingFlag";
import { ICpointInfo } from "../defines/ICpointInfo";
import { Defines } from "../defines/defines";
import { abs } from "../utils";
import { take_number } from "../utils/container_help/take_number";
import { is_num, is_str, not_zero_num } from "../utils/type_check";
import { get_next_frame_by_raw_id } from "./get_the_next";
import { take } from "./take";
import { take_not_zero_num } from "./take_not_zero_num";
import { take_num } from "./take_num";

export function cook_cpoint(unsure_cpoint: ICpointInfo, frame: IFrameInfo): void {

  unsure_cpoint.throwvx = take_not_zero_num(unsure_cpoint, "throwvx", n => n * 0.5);
  unsure_cpoint.throwvy = take_not_zero_num(unsure_cpoint, "throwvy", n => n * -0.5);
  unsure_cpoint.throwvz = take_not_zero_num(unsure_cpoint, "throwvz", n => n * 1);

  unsure_cpoint.throwinjury = take_not_zero_num(unsure_cpoint, "throwinjury", n => n * 1);
  if (unsure_cpoint.throwinjury) {
    unsure_cpoint.tx = 60;
    unsure_cpoint.ty = 15;
  }

  unsure_cpoint.decrease = take_num(unsure_cpoint, 'decrease', n => -abs(n));

  const vaction = take(unsure_cpoint, "vaction");
  const raw_injury = take(unsure_cpoint, "injury");
  if (is_num(raw_injury)) {
    unsure_cpoint.injury = abs(raw_injury);
    if (raw_injury > 0) unsure_cpoint.shaking = Defines.DEFAULT_ITR_SHAKING;
  }

  if (is_str(vaction) || is_num(vaction)) {
    unsure_cpoint.vaction = {
      ...get_next_frame_by_raw_id(vaction),
      facing: FacingFlag.SameAsCatcher,
    };
  }
}
