import { IBdyInfo, IFrameInfo, IItrInfo, IOpointInfo, IWeaponData, IWeaponInfo } from "../../common/lf2_type";
import { Defines } from "../../common/lf2_type/defines";
import { factory } from "../Factory";
import { GONE_FRAME_INFO } from "../FrameAnimater";
import { ICube, World } from "../World";
import { WEAPON_STATES } from "../state/weapon";
import { Character } from "./Character";
import { Entity } from "./Entity";
export class Weapon extends Entity<IFrameInfo, IWeaponInfo, IWeaponData> {
  static is = (v: any): v is Weapon => v?.is_ball === true;
  readonly is_weapon = true

  holder?: Entity;
  constructor(world: World, data: IWeaponData) {
    super(world, data, WEAPON_STATES);
    this.mesh.name = "Weapon: " + data.id
    this.hp = this.max_hp = data.base.weapon_hp;
  }
  override find_auto_frame(): IFrameInfo {
    const { frames, indexes } = this.data;
    if (this.position.y > 0) return frames[indexes.in_the_sky];
    return frames[indexes.on_ground];
  }
  override self_update(): void {
    super.self_update();

    const holder = this.holder
    if (holder) {
      const { wpoint: wpoint_a } = holder.get_frame();
      if (!wpoint_a) return;
      const { dvx, dvy, dvz } = wpoint_a;
      if (dvx || dvy || dvz) {
        this.enter_frame(this.data.indexes.throwing);
        const vz = (Character.is(holder)) ? holder.controller.UD * (dvz || 0) : 0;
        const vx = (dvx || 0 - Math.abs(vz / 2)) * this.facing
        this.velocity.set(vx, dvy || 0, vz)
        delete this.holder?.weapon;
        delete this.holder;
      }
    }
    if (this.hp <= 0)
      this._next_frame = GONE_FRAME_INFO;
  }
  override on_spawn_by_emitter(shotter: Entity, o: IOpointInfo, speed_z?: number): this {
    super.on_spawn_by_emitter(shotter, o, speed_z);
    if (this._frame.state === Defines.State.Weapon_OnHand) {
      this.holder = shotter
      this.holder.weapon = this
      this.team = shotter.team;
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
  override on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, r0: ICube, r1: ICube): void {
    if (itr.kind === Defines.ItrKind.Pick || itr.kind === Defines.ItrKind.PickSecretly) {
      this.holder = attacker;
      this.holder.weapon = this;
      this.team = attacker.team;
      return;
    }
    super.on_be_collided(attacker, itr, bdy, r0, r1);

    const spark_x = (Math.max(r0.left, r1.left) + Math.min(r0.right, r1.right)) / 2;
    const spark_y = (Math.min(r0.top, r1.top) + Math.max(r0.bottom, r1.bottom)) / 2;
    // const spark_z = (Math.min(r0.near, r1.near) + Math.max(r0.far, r1.far)) / 2;
    const spark_z = Math.max(r0.far, r1.far);
    if (itr.injury) this.hp -= itr.injury;

    const { base } = this.data
    const sound_name = this.hp <= 0 ? base.weapon_broken_sound : base.weapon_hit_sound
    if (sound_name) this.world.lf2.sound_mgr.play(sound_name, spark_x, spark_y, spark_z)

    const spark_frame_name = (itr.fall && itr.fall >= 60) ? 'slient_critical_hit' : 'slient_hit';
    this.world.spark(spark_x, spark_y, spark_z, spark_frame_name)

    if (this.data.base.type === Defines.WeaponType.Heavy) {
      if (itr.fall && itr.fall >= 60) {
        const vx = itr.dvx ? itr.dvx * attacker.facing : 0;
        const vy = itr.dvy ? itr.dvy : 3;
        this.velocity.x = vx / 2;
        this.velocity.y = vy;
        this.team = attacker.team;
        this._next_frame = { id: this.data.indexes.in_the_sky }
      }
    } else {
      const vx = itr.dvx ? itr.dvx * attacker.facing : 0;
      const vy = itr.dvy ? itr.dvy : 3;
      this.velocity.x = vx;
      this.velocity.y = vy;
      this.team = attacker.team;
      this._next_frame = { id: this.data.indexes.in_the_sky }
    }

  }
  follow_holder() {
    const holder = this.holder;
    if (!holder) return;
    const { wpoint: wpoint_a, centerx: centerx_a, centery: centery_a } = holder.get_frame();

    if (!wpoint_a) return;

    if (wpoint_a.weaponact !== this._frame.id) {
      this.enter_frame({ id: wpoint_a.weaponact })
    }
    const { wpoint: wpoint_b, centerx: centerx_b, centery: centery_b } = this.get_frame();
    if (!wpoint_b) return;

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