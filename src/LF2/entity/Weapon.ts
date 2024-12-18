import { World } from "../World";
import { IWeaponData, IWeaponInfo } from "../defines";
import { Defines } from "../defines/defines";
import { WEAPON_STATES } from "../state/weapon";
import Entity, { GONE_FRAME_INFO } from "./Entity";
import { Factory } from "./Factory";
export default class Weapon extends Entity<IWeaponInfo, IWeaponData> {
  readonly is_weapon = true

  constructor(world: World, data: IWeaponData) {
    super(world, data, WEAPON_STATES);
    this.name = "Weapon: " + data.id
  }

  override self_update(): void {
    super.self_update();
    const { holder } = this
    if (holder) {
      const { wpoint } = holder.frame;
      if (wpoint) { // 被丢出
        const { dvx, dvy, dvz } = wpoint;
        if (dvx !== void 0 || dvy !== void 0 || dvz !== void 0) {
          this.follow_holder()
          this.enter_frame(this.data.indexes.throwing);
          const vz = holder.controller ? holder.controller.UD * (dvz || 0) : 0;
          const vx = (dvx || 0 - Math.abs(vz / 2)) * this.facing
          this.velocities[0].set(vx, dvy || 0, vz)
          holder.holding = void 0;
          this.holder = void 0;
        }
      }
      if (!this.hp) {
        this.follow_holder()
        holder.holding = void 0;
        this.holder = void 0;
      }
      switch (holder.frame.state) {
        case Defines.State.Falling:
        case Defines.State.Lying:
        case Defines.State.Caught:
          this.follow_holder()
          this.enter_frame(this.data.indexes.in_the_sky);
          holder.holding = void 0;
          this.holder = void 0;
          break;
      }
    }
  }
}
Factory.inst.set_entity_creator('weapon', (...args) => new Weapon(...args));