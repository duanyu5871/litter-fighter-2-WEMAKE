import { StateEnum, type IFrameInfo } from "../defines";
import type { Entity } from "../entity/Entity";
import find_direction from "../entity/find_frame_direction";
import { abs } from "../utils";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Falling extends CharacterState_Base {
  private _bouncing_frames_map = new Map<string, Set<string>>();
  private _bouncings = new Set<Entity>()
  constructor(state: StateEnum = StateEnum.Falling) {
    super(state)
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    if (!this._bouncing_frames_map.has(e.data.id) && e.data.indexes?.bouncing) {
      this._bouncing_frames_map.set(
        e.data.id,
        new Set([
          ...e.data.indexes.bouncing[1],
          ...e.data.indexes.bouncing[-1],
        ]),
      );
    }
    e.drop_holding();
    if (e.hp <= 0 && e.fuse_bys?.length) {
      let { x, y } = e.velocity;
      for (const fighter of e.fuse_bys) {
        fighter.velocity_0.x = (x *= -1)
        if (fighter.position.y === 0)
          fighter.position.y = 1;
        fighter.velocity_0.y = y
      }
      e.dismiss_fusion(e.frame.id)
      if (e.next_frame) e.enter_frame(e.next_frame)
    }
  }
  is_bouncing_frame(e: Entity) {
    return !!this._bouncing_frames_map.get(e.data.id)?.has(e.frame.id);
  }
  override update(e: Entity): void {
    if (e.shaking > 0) return;
    if (this.is_bouncing_frame(e)) {
      this.update_bouncing(e);
    } else {
      this.update_falling(e);
    }
  }

  update_bouncing(e: Entity): void {
    e.handle_ground_velocity_decay(0.7);
  }

  update_falling(e: Entity): void {
    if (e.wait <= 0) {
      const { x, y } = e.velocity;
      let falling_frame_idx = 1; // ---
      if (y > 3) falling_frame_idx = 0; // ↗
      if (y < -3) falling_frame_idx = 2; // ↘
      const direction = x / e.facing > 0 ? (1 as const) : (-1 as const);
      e.enter_frame({
        id: e.data.indexes?.falling?.[direction][falling_frame_idx],
      });
    }
  }
  override leave(e: Entity, next_frame: IFrameInfo): void {
    super.leave(e, next_frame);
    this._bouncings.delete(e)
    e.fall_value = e.fall_value_max;
    e.defend_value = e.defend_value_max;
    e.resting = e.resting_max
  }
  override on_landing(e: Entity): void {
    const {
      facing,
      data: { indexes },
    } = e;
    const f = e.frame;
    const d =
      find_direction(f, indexes?.bouncing) ||
      find_direction(f, indexes?.falling) ||
      find_direction(f, indexes?.critical_hit) ||
      facing;
    const { y: vy, x: vx } = e.velocity;
    if (
      !this._bouncings.has(e) && (
        vy <= e.world.cha_bc_tst_spd_y ||
        abs(vx) > e.world.cha_bc_tst_spd_x
      )
    ) {
      e.enter_frame({ id: indexes?.bouncing?.[d][1] });
      e.merge_velocities()
      e.velocity_0.y = e.world.cha_bc_spd;
      this._bouncings.add(e)
    } else {
      e.enter_frame({ id: indexes?.lying?.[d] });
    }
  }
}
