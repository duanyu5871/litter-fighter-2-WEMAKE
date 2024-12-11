import type { IBdyInfo, IFrameInfo, IItrInfo } from "../../defines";
import type Entity from "../../entity/Entity";
import type { ICube } from "../../World";

export class BaseState<E extends Entity = Entity, F extends IFrameInfo = IFrameInfo> {
  state: number = -1;
  update(e: E): void { };
  enter?(e: E, prev_frame: F): void;
  leave?(e: E, next_frame: F): void;
  on_landing(e: E, vx: number, vy: number, vz: number): void { };
  get_gravity(e: E): number { return e.world.gravity }
  on_collision?(attacker: E, target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void;
  before_be_collided?(attacker: Entity, target: E, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): boolean | void | undefined;
  on_be_collided?(attacker: Entity, target: E, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void;
  get_auto_frame?(e: E): F | undefined;
}
export default BaseState;