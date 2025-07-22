import type { IEntityData, IFrameInfo } from "../defines";
import { check_bdy } from "./check_bdy";
import { check_field } from "./check_field";
import { check_field_undefined } from "./check_field_undefined";
import { check_itr } from "./check_itr";

/**
 * 检查frame每个字段是否正常
 *
 * @export
 * @param {Readonly<IEntityData>} data
 * @param {Readonly<IFrameInfo>} frame
 */
export function check_frame(data: Readonly<IEntityData>, frame: Readonly<IFrameInfo>) {
  const frame_name = `${data.base.name}#frame`
  check_field(frame, frame_name, 'id', 'string');
  check_field(frame, frame_name, 'name', 'string');
  check_field(frame, frame_name, 'state', 'number');
  check_field(frame, frame_name, 'wait', 'number');
  // TODO: pic
  // TODO: next
  check_field_undefined(frame, frame_name, 'dvx', 'number');
  check_field_undefined(frame, frame_name, 'dvy', 'number');
  check_field_undefined(frame, frame_name, 'dvz', 'number');
  check_field_undefined(frame, frame_name, 'acc_x', 'number');
  check_field_undefined(frame, frame_name, 'acc_y', 'number');
  check_field_undefined(frame, frame_name, 'acc_z', 'number');
  check_field_undefined(frame, frame_name, 'vxm', 'number');
  check_field_undefined(frame, frame_name, 'vym', 'number');
  check_field_undefined(frame, frame_name, 'vzm', 'number');
  check_field(frame, frame_name, 'centerx', 'number');
  check_field(frame, frame_name, 'centery', 'number');
  check_field_undefined(frame, frame_name, 'sound', 'string');
  check_field_undefined(frame, frame_name, 'hp', 'number');
  // TODO: hold
  // TODO: hit

  frame.bdy?.forEach((v, i) => check_bdy(data, frame, v, i));
  frame.itr?.forEach((v, i) => check_itr(data, frame, v, i));
  // TODO: wpoint
  // TODO: bpoint
  // TODO: opoint
  // TODO: cpoint
  // TODO: indicator_info
  check_field_undefined(frame, frame_name, 'invisible', [0, 1]);
  check_field_undefined(frame, frame_name, 'no_shadow', [0, 1]);
  check_field_undefined(frame, frame_name, 'ctrl_acc_x', 'number');
  check_field_undefined(frame, frame_name, 'ctrl_spd_x', 'number');
  check_field_undefined(frame, frame_name, 'ctrl_spd_x_m', 'number');
  check_field_undefined(frame, frame_name, 'ctrl_acc_y', 'number');
  check_field_undefined(frame, frame_name, 'ctrl_spd_y', 'number');
  check_field_undefined(frame, frame_name, 'ctrl_spd_y_m', 'number');
  check_field_undefined(frame, frame_name, 'ctrl_acc_z', 'number');
  check_field_undefined(frame, frame_name, 'ctrl_spd_z', 'number');
  check_field_undefined(frame, frame_name, 'ctrl_spd_z_m', 'number');
  check_field_undefined(frame, frame_name, 'jump_flag', [1, 0]);
  // TODO: on_dead
  // TODO: on_exhaustion
  // TODO: on_landing
  // TODO: behavior
  // TODO: on_hit_ground
}
check_frame.TAG = 'check_frame'
