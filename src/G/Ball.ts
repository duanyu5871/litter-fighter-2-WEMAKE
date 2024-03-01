import { BALL_STATES } from '../ENTITY_STATES';
import { Defines } from '../defines';
import { IBallData, IBallFrameInfo, IBdyInfo, IFrameInfo, IGameObjData, IGameObjInfo, IItrInfo, IOpointInfo, TFace } from '../js_utils/lf2_type';
import { A_SHAKE, Entity } from './Entity';
import { factory } from './Factory';
import { EMPTY_FRAME_INFO } from './FrameAnimater';
import type { ICube, World } from './World';
import { sound_mgr } from './loader/SoundMgr';


export class Ball extends Entity<IBallData, IBallFrameInfo> {
  constructor(world: World, data: IBallData) {
    super(world, data, BALL_STATES);
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

  setup(shotter: Entity, o: IOpointInfo) {
    const shotter_frame = shotter.get_frame();
    this.team = shotter.team;
    this.face = (o.facing === 1 ? -shotter.face : shotter.face) as TFace;
    let { x, y, z } = shotter.position;

    y = y + shotter_frame.centery - o.y;
    x = x - this._face * (shotter_frame.centerx - o.x);
    this.position.set(x, y, z);
    this.enter_frame(o.action ?? 0);
    console.log(this.get_frame())
    return this;
  }
  set_frame(v: IBallFrameInfo): void {
    super.set_frame(v);
    this.shadow.visible = !v.no_shadow;
  }
  on_collision(target: Entity<IGameObjData<IGameObjInfo, IFrameInfo>>, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    if (target.data.type === Defines.EntityEnum.Character) {
      // const t = target as Character;
      this._motionless = A_SHAKE;
      const f = this.get_frame();
      f.on_hitting && this.enter_frame(f.on_hitting);
      this.velocity.x = 0;
      this.velocity.z = 0;
      this.velocity.y = 0;
      this.data.base.weapon_hit_sound && sound_mgr.play(this.data.base.weapon_hit_sound,
        this.position.x, this.position.y, this.position.z)
    }
  }
}


factory.set('ball', (...args) => new Ball(...args))