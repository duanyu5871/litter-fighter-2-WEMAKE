import { Bodies, Body, Query } from "matter-js";
import { Behavior } from "../../LF2/behavior";
import type { BounceTales } from "./BounceTales";

export enum PlayerState {
  Idle = 'Idle',
  Walk = 'Walk',
  Jump = 'Jump',
  Fall = 'Fall',
  Attack = 'Attack',
  Die = 'Die',
  OnAir = 'OnAir'
}
export const max_jump_frames = 3
export class Player extends Behavior.Actor {
  radius = 49;
  body = Bodies.circle(100, -100, this.radius, {}, 100);
  solution: BounceTales;
  constructor(solution: BounceTales) {
    super();
    this.solution = solution;
    Behavior.Noding(PlayerState.Jump, this, solution)
      .on_update(() => this.on_update_jump())
      .on_leave(() => this.on_leave_jump())
      .actor(this)
      .done();
    Behavior.Noding(PlayerState.Idle, this, solution)
      .on_update(() => this.on_update_move())
      .actor(this)
      .done();
    Behavior.Connecting(this)
      .start(PlayerState.Idle)
      .end(PlayerState.Jump)
      .judge(() => {
        const ks_value = this.solution.key_state('w')?.value || 0;
        return ks_value > 0 && ks_value <= 10 && this.is_ground
      }).done();
    Behavior.Connecting(this)
      .start(PlayerState.Jump)
      .end(PlayerState.Idle)
      .judge(() => !this.remain_jump_frames)
      .done();
    this.use_behavior(PlayerState.Idle);
  }
  remain_jump_frames = 3;
  get is_ground() {
    const collides = Query.collides(
      this.body,
      [
        ...this.solution.grounds,
        ...this.solution.bricks
      ]
    )
    for (const collide of collides) {
      let nx = 0;
      let ny = 0;
      const { x, y } = collide.normal;
      if (collide.bodyA.id === this.body.id) {
        nx = x;
        ny = y;
      } else if (collide.bodyB.id === this.body.id) {
        nx = -x;
        ny = -y;
      } else {
        continue;
      }
      const angle = Math.atan2(ny, nx);
      if (angle < -0.52359878 && angle > -2.61799388)
        return true
    }
    return false
  }
  on_update_move() {
    const vx = this.body.velocity.x;
    const max_vx = 5
    const direction = (
      this.solution.is_keydown('d') -
      this.solution.is_keydown('a')
    )
    if (vx < max_vx && direction > 0) {
      Body.applyForce(this.body, this.body.position, { x: 0.01 * direction, y: this.body.force.y })
    } else if (vx > -max_vx && direction < 0) {
      Body.applyForce(this.body, this.body.position, { x: 0.01 * direction, y: this.body.force.y })
    } else if (direction > 0) {
      Body.setVelocity(this.body, { x: max_vx, y: this.body.velocity.y })
    } else if (direction < 0) {
      Body.setVelocity(this.body, { x: -max_vx, y: this.body.velocity.y })
    }
    if (direction === 0 && Math.abs(vx) < 0.5 && this.is_ground) {
      Body.setVelocity(this.body, { x: 0, y: this.body.velocity.y })
    }
  }
  on_update_jump(): void {
    Body.setVelocity(this.body, { x: this.body.velocity.x, y: -12 })
    --this.remain_jump_frames;
    console.log('on_update_jump')
    this.on_update_move();
  }
  on_leave_jump() {
    this.remain_jump_frames = max_jump_frames;
  }
}
