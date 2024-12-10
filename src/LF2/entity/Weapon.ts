import { World } from "../World";
import { IFrameInfo, IOpointInfo, IWeaponData, IWeaponInfo } from "../defines";
import { Defines } from "../defines/defines";
import { WEAPON_STATES } from "../state/weapon";
import Entity, { GONE_FRAME_INFO } from "./Entity";
import { Factory } from "./Factory";
export default class Weapon extends Entity<IFrameInfo, IWeaponInfo, IWeaponData> {
  readonly is_weapon = true

  constructor(world: World, data: IWeaponData) {
    super(world, data, WEAPON_STATES);
    this.name = "Weapon: " + data.id
    this.hp = this.max_hp = data.base.weapon_hp;
  }

  override find_auto_frame(): IFrameInfo {
    const { frames, indexes } = this.data;
    if (this.position.y > 0) return frames[indexes.in_the_sky];
    return frames[indexes.on_ground];
  }

  /** @inheritdoc */
  override self_update(): void {
    super.self_update();
    const { holder } = this
    if (holder) {
      const { wpoint, state } = holder.frame;
      if (wpoint) { // 武器被丢出
        const { dvx, dvy, dvz } = wpoint;
        if (dvx !== void 0 || dvy !== void 0 || dvz !== void 0) {
          this.follow_holder()
          this.enter_frame(this.data.indexes.throwing);
          const vz = holder.controller ? holder.controller.UD * (dvz || 0) : 0;
          const vx = (dvx || 0 - Math.abs(vz / 2)) * this.facing
          this.velocity.set(vx, dvy || 0, vz)
          holder.holding = void 0;
          this.holder = void 0;
        }
      }
      /*
        TODO: 
          武器是否被打掉是不是又攻击方的itr来控制更好呢？
          这样也许可以实现更丰富的东西。
          -Gim
      */
      if (
        state === Defines.State.Falling ||
        state === Defines.State.Lying ||
        state === Defines.State.Caught
      ) {
        this.follow_holder()
        this.enter_frame(this.data.indexes.in_the_sky);
        holder.holding = void 0;
        this.holder = void 0;
      }
    }
    if (this.hp <= 0) {
      // TODO: WEAPON BROKEN. -GIM
      this._next_frame = GONE_FRAME_INFO;
      if (this.data.base.brokens?.length) {
        for (const opoint of this.data.base.brokens) {
          const count = opoint.multi ?? 1
          for (let i = 0; i < count; ++i) {
            const s = 2 * (i - (count - 1) / 2);
            this.spawn_entity(opoint, s)
          }
        }
      }
    }
  }

  override on_spawn_by_emitter(emitter: Entity, o: IOpointInfo, speed_z?: number): this {
    super.on_spawn_by_emitter(emitter, o, speed_z);
    if (this.frame.state === Defines.State.Weapon_OnHand) {
      this.holder = emitter
      this.holder.holding = this
      this.team = emitter.team;
    }
    return this;
  }
}
Factory.inst.set('weapon', (...args) => new Weapon(...args));