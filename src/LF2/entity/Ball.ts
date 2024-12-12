import type { World } from '../World';
import type { IBallData, IBallFrameInfo, IBallInfo } from '../defines';
import { Defines } from '../defines';
import { BALL_STATES } from '../state/ball';
import Entity from './Entity';
import { Factory } from './Factory';

export default class Ball extends Entity<IBallFrameInfo, IBallInfo, IBallData> {
  static override readonly TAG: string = 'Ball';
  readonly is_ball = true;
  constructor(world: World, data: IBallData) {
    super(world, data, BALL_STATES);
    this.name = "ball: " + data.id
  }
  override set_frame(v: IBallFrameInfo): void {
    switch (this.frame.behavior) {
      case Defines.BallBehavior._01:
      case Defines.BallBehavior._02:
      case Defines.BallBehavior._03:
        this.unsubscribe_nearest_enemy(); break;
    }
    super.set_frame(v);
    switch (v.behavior) {
      case Defines.BallBehavior._01:
      case Defines.BallBehavior._02:
      case Defines.BallBehavior._03:
        this.subscribe_nearest_enemy(); break;
    }
  }
  play_hit_sound() {
    const { weapon_hit_sound } = this.data.base;
    if (!weapon_hit_sound) return;
    this.world.lf2.sounds.play(
      weapon_hit_sound,
      this.position.x,
      this.position.y,
      this.position.z
    )
  }
  override update(): void {
    super.update();
    const f = this.get_frame();
    if (this.hp <= 0) { // FIXME: 避免一直判断
      f.on_timeout && this.enter_frame(f.on_timeout)
    } else if (f.hp) {
      this.hp -= f.hp;
    }
  }
}
Factory.inst.set_entity_creator('ball', (...args) => new Ball(...args));