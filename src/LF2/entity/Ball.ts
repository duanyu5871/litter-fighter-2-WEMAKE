import { Log } from '../../Log';
import type { ICube, World } from '../World';
import type { IBallData, IBallFrameInfo, IBallInfo, IBdyInfo, IItrInfo } from '../defines';
import { Defines } from '../defines';
import { BALL_STATES } from '../state/ball';
import Entity from './Entity';
import { Factory } from './Factory';
import { is_character, is_weapon } from './type_check';

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
  override on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    super.on_collision(target, itr, bdy, a_cube, b_cube);
    if (is_character(target) || is_weapon(target)) {
      const f = this.get_frame();
      switch (itr.kind) {
        case Defines.ItrKind.Heal:
          if (!itr.injury) break;
          // TODO: 
          break;
        case Defines.ItrKind.DeadWhenHit:
          this.play_hit_sound()
          if (f.on_timeout) this.enter_frame(f.on_timeout)
          else Log.print(Ball.TAG + '::on_collision', 'Defines.ItrKind.DeadWhenHit, but on_timeout not set.')
          break;
        default:
          this.play_hit_sound()
          if (f.on_hitting) this.enter_frame(f.on_hitting);
          else Log.print(Ball.TAG + '::on_collision', 'on_hitting not set.')
          break;
      }
      if (itr.on_hit) this.enter_frame(itr.on_hit)
      this.velocity.x = 0;
      this.velocity.z = 0;
      this.velocity.y = 0;
    }
  }
  override on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    super.on_be_collided(attacker, itr, bdy, a_cube, b_cube);
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