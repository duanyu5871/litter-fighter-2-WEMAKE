import { IBdyInfo, IFrameInfo, IItrInfo, IOpointInfo, IWeaponData, IWeaponInfo } from "../../js_utils/lf2_type";
import { Defines } from "../../js_utils/lf2_type/defines";
import { factory } from "../Factory";
import { ICube, World } from "../World";
import { WEAPON_STATES } from "../state/weapon";
import { Character } from "./Character";
import { Entity } from "./Entity";
export class Weapon extends Entity<IFrameInfo, IWeaponInfo, IWeaponData> {
  holder?: Entity;
  constructor(world: World, data: IWeaponData) {
    super(world, data, WEAPON_STATES);
    this.hp = data.base.weapon_hp;
  }
  override find_auto_frame(): IFrameInfo {
    const { frames, indexes } = this.data;
    if (this.position.y > 0) return frames[indexes.in_the_sky];
    return frames[indexes.on_ground];
  }
  override self_update(): void {
    super.self_update();

    const holder = this.holder
    if (!holder) return;
    const { wpoint: wpoint_a } = holder.get_frame();
    if (!wpoint_a) return;
    const { dvx, dvy, dvz } = wpoint_a;

    if (dvx || dvy || dvz) {
      this.enter_frame(this.data.indexes.throwing);
      const vz = (holder instanceof Character) ? holder.controller.UD1 * (dvz || 0) : 0;
      const vx = (dvx || 0 - Math.abs(vz / 2)) * this.facing
      this.velocity.set(vx, dvy || 0, vz)
      delete this.holder?.weapon;
      delete this.holder;
    }
  }
  override setup(shotter: Entity, o: IOpointInfo, speed_z?: number): this {
    super.setup(shotter, o, speed_z);
    if (this._frame.state === Defines.State.Weapon_OnHand) {
      this.holder = shotter
      this.holder.weapon = this
    }
    return this;
  }
  override on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    super.on_collision(target, itr, bdy, a_cube, b_cube);

    if (this._frame.state === Defines.State.Weapon_OnHand) {
      return;
    }
    this.velocity.x = -0.3 * this.velocity.x
    this.velocity.y = -0.3 * this.velocity.y
    this.enter_frame(this.find_auto_frame())
  }

  follow_holder() {
    const holder = this.holder
    if (!holder) return;
    const { wpoint: wpoint_a, centerx: centerx_a, centery: centery_a } = holder.get_frame();
    const { wpoint: wpoint_b, centerx: centerx_b, centery: centery_b } = this.get_frame();
    if (!wpoint_a || !wpoint_b) return;

    if (wpoint_a.weaponact !== this._frame.id) {
      this.enter_frame({ id: wpoint_a.weaponact })
    }
    const { x, y, z } = holder.position;
    this.facing = holder.facing;
    this.position.set(
      x + this.facing * (wpoint_a.x - centerx_a + centerx_b - wpoint_b.x),
      y + centery_a - wpoint_a.y - centery_b + wpoint_b.y,
      z
    );
    this.update_sprite_position()
  }
}
factory.set('weapon', (...args) => new Weapon(...args))