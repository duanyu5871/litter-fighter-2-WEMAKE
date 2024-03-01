import { BALL_STATES } from '../ENTITY_STATES';
import { IFrameInfo, IOpointInfo, IProjecttileData, TFace } from '../js_utils/lf2_type';
import { Entity } from './Entity';
import { factory } from './Factory';
import { EMPTY_FRAME_INFO } from './FrameAnimater';
import type { World } from './World';


export class Projecttile extends Entity<IProjecttileData> {
  constructor(world: World, data: IProjecttileData) {
    super(world, data, BALL_STATES);
  }
  override find_auto_frame(): IFrameInfo {
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
    return this;
  }
}


factory.set('projecttile', (...args) => new Projecttile(...args))