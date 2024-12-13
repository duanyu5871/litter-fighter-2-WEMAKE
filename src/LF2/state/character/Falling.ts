import type { IFrameInfo } from "../../defines";
import type Character from '../../entity/Character';
import find_direction from "../../entity/find_frame_direction";
import BaseCharacterState from "./Base";

export default class Falling extends BaseCharacterState {
  _bouncing_frames_map = new Map<string, Set<string>>();
  _begin_velocty_y_map = new Map<string, number>();

  override enter(e: Character, prev_frame: IFrameInfo): void {
    const { indexes: { bouncing } } = e.data;
    if (!this._bouncing_frames_map.has(e.data.id)) {
      this._bouncing_frames_map.set(e.data.id, new Set([
        ...bouncing[1],
        ...bouncing[-1]
      ]));
    }
    this._begin_velocty_y_map.set(e.data.id, e.velocities[0].y);
  }

  is_bouncing_frame(e: Character) {
    return !!this._bouncing_frames_map.get(e.data.id)?.has(e.frame.id);
  }

  override update(e: Character): void {
    if (e.shaking > 0) return;
    if (this.is_bouncing_frame(e)) {
      this.update_bouncing(e);
    } else {
      this.update_falling(e);
    }
  }

  update_bouncing(e: Character): void {
    e.handle_gravity();
    e.handle_ground_velocity_decay(0.7);
    e.handle_frame_velocity();
  }

  update_falling(e: Character): void {
    e.handle_gravity();
    e.handle_frame_velocity();
    const { data: { indexes: { falling } } } = e;
    const { x, y } = e.velocity;

    let falling_frame_idx = 1; // ---
    if (y > 1) falling_frame_idx = 0; // ↗
    if (y < -1) falling_frame_idx = 2; // ↘

    const direction = x / e.facing >= 0 ? (1 as const) : (-1 as const);
    e.enter_frame({ id: falling[direction][falling_frame_idx] });
  }

  override on_landing(e: Character): void {
    const { facing, data: { indexes } } = e;
    const f = e.get_frame();
    const d = find_direction(f, indexes.bouncing) ||
      find_direction(f, indexes.falling) ||
      find_direction(f, indexes.critical_hit) || facing;
    const { y: vy } = e.velocity;
    if (vy <= -4) {
      e.enter_frame({ id: indexes.bouncing[d][1] });
      e.velocities[0].y = 2;
    } else {
      e.enter_frame({ id: indexes.lying[d] });
    }
  }
}