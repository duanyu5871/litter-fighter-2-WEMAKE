import { IBallData, IBallFrameInfo, IBallInfo, IBdyInfo, IItrInfo, IOpointInfo } from '../../common/lf2_type';
import { Defines } from '../../common/lf2_type/defines';
import { factory } from '../Factory';
import { EMPTY_FRAME_INFO } from '../FrameAnimater';
import type { ICube, World } from '../World';
import { BALL_STATES } from '../state/ball';
import Entity from './Entity';

export default class Ball extends Entity<IBallFrameInfo, IBallInfo, IBallData> {
  static is = (v: any): v is Ball => v?.is_ball === true;
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
  on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    super.on_collision(target, itr, bdy, a_cube, b_cube);
    if (target.data.type === Defines.EntityEnum.Character) {
      const f = this.get_frame();
      f.on_hitting && this.enter_frame(f.on_hitting);
      this.velocity.x = 0;
      this.velocity.z = 0;
      this.velocity.y = 0;
      this.data.base.weapon_hit_sound && this.world.lf2.sounds.play(
        this.data.base.weapon_hit_sound,
        this.position.x, this.position.y, this.position.z
      )
    }
  }
  on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    super.on_be_collided(attacker, itr, bdy, a_cube, b_cube);
  }
  update(): void {
    super.update();
    const f = this.get_frame();
    if (this.hp <= 0) {
      f.on_dead && this.enter_frame(f.on_dead)
    } else if (f.hp) {
      this.hp -= f.hp;
    }
  }
}


factory.set('ball', (...args) => new Ball(...args))