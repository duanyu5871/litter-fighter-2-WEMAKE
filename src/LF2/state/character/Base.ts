import { Defines, IFrameInfo } from '../../defines';
import type Character from '../../entity/Character';
import { is_weapon } from '../../entity/type_check';
import BaseState from "../base/BaseState";

export default class BaseCharacterState extends BaseState<Character> {
  override update(e: Character): void {
    e.handle_gravity();
    e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
  }
  override on_landing(e: Character, vx: number, vy: number, vz: number): void {
    e.enter_frame({ id: e.data.indexes.landing_2 });
  }
  override get_auto_frame(e: Character): IFrameInfo | undefined {
    const { in_the_sky, standing, heavy_obj_walk } = e.data.indexes;
    let fid: string;
    if (is_weapon(e.holding) && e.holding.data.base.type === Defines.WeaponType.Heavy) {
      fid = heavy_obj_walk[0]
    } else if (e.position.y > 0) {
      fid = in_the_sky[0]
    } else if (e.hp > 0) {
      fid = standing;
    } else {
      fid = standing; // TODO
    }
    return e.data.frames[fid];
  }
}
