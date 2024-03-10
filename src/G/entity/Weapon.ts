import { IBdyInfo, IFrameInfo, IGameObjData, IGameObjInfo, IItrInfo, IOpointInfo, IWeaponData, IWeaponInfo } from "../../js_utils/lf2_type";
import { factory } from "../Factory";
import { ICube, World } from "../World";
import { WEAPON_STATES } from "../state/weapon";
import { Entity } from "./Entity";
export class Weapon extends Entity<IFrameInfo, IWeaponInfo, IWeaponData> {
  constructor(world: World, data: IWeaponData) {
    super(world, data, WEAPON_STATES);
  }
  override find_auto_frame(): IFrameInfo {
    return this.data.frames['0'];
  }
  override setup(shotter: Entity, o: IOpointInfo, speed_z?: number): this {
    super.setup(shotter, o, speed_z)
    return this;
  }
  override on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    super.on_collision(target, itr, bdy, a_cube, b_cube);
    this.velocity.x = -0.3 * this.velocity.x
    this.velocity.y = -0.3 * this.velocity.y
    this.enter_frame(this.find_auto_frame())
  }
}
factory.set('weapon', (...args) => new Weapon(...args))