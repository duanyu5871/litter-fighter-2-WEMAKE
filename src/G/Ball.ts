import { BALL_STATES } from './state/BallState';
import { Defines } from '.././js_utils/lf2_type/defines';
import { IBallData, IBallFrameInfo, IBdyInfo, IItrInfo, IOpointInfo, TFace } from '../js_utils/lf2_type';
import { Entity } from './Entity';
import { factory } from './Factory';
import { EMPTY_FRAME_INFO } from './FrameAnimater';
import type { ICube, World } from './World';
import { sound_mgr } from './loader/SoundMgr';


export class Ball extends Entity<IBallData, IBallFrameInfo> {
  constructor(world: World, data: IBallData) {
    super(world, data, BALL_STATES);
    this.hp = this.data.base.hp;
  }
  override find_auto_frame() {
    return this.data.frames[0] ?? EMPTY_FRAME_INFO;
  }
  override handle_frame_velocity(): void {
    super.handle_frame_velocity();
    const f = this.get_frame();

    if (f.speedz || f.dvz) {
      this.velocity.z = (f.speedz || 0) + (f.dvz || 0);
    }
  }

  override setup(shotter: Entity, o: IOpointInfo) {
    return super.setup(shotter, o);
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
      this.data.base.weapon_hit_sound && sound_mgr.play(this.data.base.weapon_hit_sound,
        this.position.x, this.position.y, this.position.z)
    }
  }
  on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    super.on_be_collided(attacker, itr, bdy, a_cube, b_cube);
  }
  update(): void {
    super.update();

    const f = this.get_frame();

    if (this.hp <= 0) {
      console.log(f)
      f.on_dead && this.enter_frame(f.on_dead)
    } else if (f.hp) {
      this.hp -= f.hp;
    }
  }
}


factory.set('ball', (...args) => new Ball(...args))