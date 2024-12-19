import type { World } from '../World';
import type { IEntityData } from '../defines';
import { BALL_STATES } from '../state/ball';
import Entity from './Entity';
import { Factory } from './Factory';

export default class Ball extends Entity {
  static override readonly TAG: string = 'Ball';
  readonly is_ball = true;
  constructor(world: World, data: IEntityData) {
    super(world, data, BALL_STATES);
    this.name = "ball: " + data.id
  }
}
Factory.inst.set_entity_creator('ball', (...args) => new Ball(...args));