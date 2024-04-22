import { IFrameInfo } from "../../../common/lf2_type";
import type { Character } from '../../entity/Character';
import find_direction from "../../entity/find_frame_direction";
import BaseCharacterState from "./Base";

export default class Falling extends BaseCharacterState {
  _ignore_frames = new Map<string | number, Set<string>>();
  enter(e: Character, prev_frame: IFrameInfo): void {
    super.enter(e, prev_frame);
    const { id: data_id, indexes: { bouncing } } = e.data;
    if (!this._ignore_frames.has(data_id)) {
      this._ignore_frames.set(data_id, new Set([...bouncing[1], ...bouncing[-1]]));
    }
  }
  begin(e: Character): void {
    e.on_gravity();
    const { data: { id: data_id } } = e;
    const ignore_frames = this._ignore_frames.get(data_id);
    const { id: frame_id } = e.get_frame();
    if (ignore_frames?.has('' + frame_id)) {
      e.velocity_decay(0.7);
    } else {
      e.velocity_decay();
    }
    e.handle_frame_velocity();
  }
  update(e: Character): void {
    super.update(e);
    if (e.shaking > 0) return;
    const { data: { id: data_id, indexes: { falling } } } = e;
    const { id: frame_id } = e.get_frame();

    if (this._ignore_frames.get(data_id)?.has(frame_id)) return;

    const { x, y } = e.velocity;
    let falling_frame_idx = 1; // ---
    if (y > 1) falling_frame_idx = 0; // ↗
    if (y < -1) falling_frame_idx = 2; // ↘

    const direction = x / e.facing >= 0 ? (1 as const) : (-1 as const);
    e.enter_frame({ id: falling[direction][falling_frame_idx] });
  }
  on_landing(e: Character, vx: number, vy: number, vz: number): void {
    const { facing, data: { indexes } } = e;
    const f = e.get_frame();
    const d = find_direction(f, indexes.bouncing) ||
      find_direction(f, indexes.falling) ||
      find_direction(f, indexes.critical_hit) || facing;
    if (vy <= -4) {
      e.enter_frame({ id: indexes.bouncing[d][1] });
      e.velocity.y = 2;
    } else {
      e.enter_frame({ id: indexes.lying[d] });
    }
  }
}