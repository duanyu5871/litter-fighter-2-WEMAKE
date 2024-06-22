import { Factory } from './Factory';
import { EMPTY_FRAME_INFO } from './FrameAnimater';
import type { ICube, World } from '../World';
import type { IBallData, IBallFrameInfo, IBallInfo, IBdyInfo, IItrInfo, IOpointInfo } from '../defines';
import { Defines } from '../defines/defines';
import { BALL_STATES } from '../state/ball';
import Entity from './Entity';
import { is_character, is_weapon } from './type_check';
import { Log } from '../../Log';

export default class Ball extends Entity<IBallFrameInfo, IBallInfo, IBallData> {
  readonly is_ball = true
  ud = 0;
  constructor(world: World, data: IBallData) {
    super(world, data, BALL_STATES);
    this.mesh.name = "ball: " + data.id
    this.hp = this.data.base.hp;
  }
  override find_auto_frame() {
    return this.data.frames[0] ?? EMPTY_FRAME_INFO;
  }
  override handle_frame_velocity(): void {
    super.handle_frame_velocity();
    const { speedz = 0, dvz = 0 } = this.get_frame();
    this.velocity.z = this.ud * speedz + dvz;
  }

  override on_spawn_by_emitter(shotter: Entity, o: IOpointInfo, speed_z: number) {
    const ret = super.on_spawn_by_emitter(shotter, o);
    this.ud = speed_z;
    return ret;
  }
  set_frame(v: IBallFrameInfo): void {
    super.set_frame(v);
    this.shadow.visible = !v.no_shadow;
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
  on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
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
          if (f.on_dead) this.enter_frame(f.on_dead)
          else Log.print('Ball', 'Defines.ItrKind.DeadWhenHit, but on_dead not set.')
          break;
        default:
          this.play_hit_sound()
          if (f.on_hitting) this.enter_frame(f.on_hitting);
          else Log.print('Ball', 'on_hitting not set.')
          break;
      }
      if (itr.on_hit) this.enter_frame(itr.on_hit)
      this.velocity.x = 0;
      this.velocity.z = 0;
      this.velocity.y = 0;
    }
  }
  on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    super.on_be_collided(attacker, itr, bdy, a_cube, b_cube);
  }
  update(): void {
    super.update();
    const f = this.get_frame();
    if (this.hp <= 0) { // FIXME: 避免一直判断
      f.on_dead && this.enter_frame(f.on_dead)
    } else if (f.hp) {
      this.hp -= f.hp;
    }
  }
}
Factory.inst.set('ball', (...args) => new Ball(...args));