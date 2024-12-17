import type { World } from '../World';
import type { IBallData, IFrameInfo, IEntityInfo, } from '../defines';
import { Defines, } from '../defines';
import { BALL_STATES } from '../state/ball';
import Entity from './Entity';
import { Factory } from './Factory';

export default class Ball extends Entity<IEntityInfo, IBallData> {
  static override readonly TAG: string = 'Ball';
  readonly is_ball = true;
  constructor(world: World, data: IBallData) {
    super(world, data, BALL_STATES);
    this.name = "ball: " + data.id
  }
  override set_frame(v: IFrameInfo): void {
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
}
Factory.inst.set_entity_creator('ball', (...args) => new Ball(...args));